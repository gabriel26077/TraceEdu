from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

# Database & Infrastructure
from app.infrastructure.database.session import get_db
from app.infrastructure.persistence.postgresql import (
    SQLAlchemyUserRepository,
    SQLAlchemySubjectRepository,
    SQLAlchemyAccountRepository,
    SQLAlchemyEnrollmentRepository,
    SQLAlchemyClassGroupRepository,
    SQLAlchemySubjectOfferingRepository,
    SQLAlchemySchoolRepository,
    SQLAlchemySchoolMemberRepository
)

# Application Use Cases
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.application.user.list_users_use_case import ListUsersUseCase
from app.application.subject.register_subject_use_case import RegisterSubjectUseCase, RegisterSubjectInput
from app.application.subject.list_subjects_use_case import ListSubjectsUseCase
from app.application.subject.create_offering_use_case import CreateOfferingUseCase, CreateOfferingInput
from app.application.subject.list_offerings_use_case import ListOfferingsUseCase
from app.application.enrollment.create_enrollment_use_case import CreateEnrollmentUseCase, CreateEnrollmentInput
from app.application.enrollment.post_grade_use_case import PostGradeUseCase, PostGradeInput
from app.application.classroom.create_group_use_case import CreateGroupUseCase, CreateGroupInput
from app.application.classroom.enroll_student_use_case import EnrollStudentUseCase, EnrollStudentInput
from app.application.classroom.get_class_report_use_case import GetClassGradesReportUseCase
from app.application.school.register_school_use_case import RegisterSchoolUseCase, RegisterSchoolInput
from app.application.school.maintenance_use_cases import ArchiveSchoolUseCase, DeleteSchoolUseCase, ActivateSchoolUseCase
from app.application.school.list_schools_use_case import ListSchoolsUseCase
from app.application.user.manage_account_use_case import ManageAccountUseCase
from app.application.user.list_global_users_use_case import ListGlobalUsersUseCase
from app.application.user.delete_user_use_case import DeleteUserUseCase
from app.infrastructure.security.auth_service import AuthService

# Domain Policies
from app.domain.enrollment.policies import SubstitutionRecoveryPolicy

# Schemas
from .schemas import (
    UserCreate, UserResponse,
    SubjectCreate, SubjectResponse,
    SubjectOfferingCreate, SubjectOfferingResponse,
    EnrollmentCreate, EnrollmentResponse,
    ClassGroupCreate, ClassGroupResponse,
    EnrollStudentInGroupRequest,
    GradePostRequest, ClassReportResponse,
    SchoolCreate, SchoolResponse, PasswordReset
)

# Auth & Dependencies
from .endpoints import auth
from .dependencies import get_current_user, verify_school_access, verify_platform_admin

router = APIRouter()

# --- AUTH ROUTES ---
router.include_router(auth.router, prefix="/auth", tags=["auth"])

# --- PLATFORM (SUPER ADMIN) ROUTES ---

@router.post("/schools", response_model=SchoolResponse, status_code=201)
def register_school(data: SchoolCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        school_repo = SQLAlchemySchoolRepository(db)
        user_repo = SQLAlchemyUserRepository(db)
        member_repo = SQLAlchemySchoolMemberRepository(db)
        use_case = RegisterSchoolUseCase(db, school_repo, user_repo, member_repo)
        
        input_data = RegisterSchoolInput(
            name=data.name, coordination_email=data.coordination_email,
            admin_name=data.admin_name, admin_email=data.admin_email, 
            admin_password=data.admin_password,
            admin_cpf=data.admin_cpf
        )
        
        result = use_case.execute(input_data)
        school = school_repo.get_by_id(result.school_id)
        db.commit()
        return school
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schools", response_model=List[SchoolResponse])
def list_schools(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = SQLAlchemySchoolRepository(db)
    use_case = ListSchoolsUseCase(repo, db)
    return use_case.execute(current_user)

@router.patch("/schools/{school_id}/archive", status_code=204)
def archive_school(school_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = SQLAlchemySchoolRepository(db)
    use_case = ArchiveSchoolUseCase(repo, db)
    use_case.execute(school_id)
    return None

@router.delete("/schools/{school_id}", status_code=204)
def delete_school(school_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = SQLAlchemySchoolRepository(db)
    use_case = DeleteSchoolUseCase(repo, db)
    use_case.execute(school_id)
    return None

@router.patch("/schools/{school_id}/activate", status_code=204)
def activate_school(school_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    repo = SQLAlchemySchoolRepository(db)
    use_case = ActivateSchoolUseCase(repo, db)
    use_case.execute(school_id)
    return None

# --- PLATFORM ADMIN ROUTES ---

@router.get("/platform/users")
def list_platform_users(db: Session = Depends(get_db), _ = Depends(verify_platform_admin)):
    use_case = ListGlobalUsersUseCase(db)
    return use_case.execute()

@router.delete("/platform/users/{user_id}", status_code=204)
def delete_platform_user(user_id: str, db: Session = Depends(get_db), current_user = Depends(verify_platform_admin)):
    use_case = DeleteUserUseCase(db)
    use_case.execute(user_id, current_user.uid)
    return None

# --- SCHOOL-SPECIFIC ROUTES ---

@router.post("/schools/{school_id}/users", response_model=UserResponse, status_code=201)
def register_user(school_id: str, user_data: UserCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        repository = SQLAlchemyUserRepository(db)
        member_repo = SQLAlchemySchoolMemberRepository(db)
        use_case = RegisterUserUseCase(repository, member_repo)
        use_case_input = RegisterUserInput(
            name=user_data.name, school_id=school_id, roles=user_data.roles, 
            email=user_data.email, cpf=user_data.cpf
        )
        result = use_case.execute(use_case_input)
        
        # If password is provided, create account
        if user_data.password:
            auth_service = AuthService()
            account_use_case = ManageAccountUseCase(db, auth_service)
            account_use_case.create_or_update_account(
                user_id=result.uid,
                username=user_data.email or result.uid,
                password=user_data.password
            )
            
        db.commit()
        # Ensure we return a format compatible with UserResponse
        return {
            "uid": result.uid,
            "name": result.name,
            "email": str(result.email) if result.email else None,
            "roles": [str(r) for r in result.roles]
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/users/{user_id}/password", status_code=204)
def reset_password(user_id: str, data: PasswordReset, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        user_repo = SQLAlchemyUserRepository(db)
        user = user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        auth_service = AuthService()
        account_use_case = ManageAccountUseCase(db, auth_service)
        account_use_case.create_or_update_account(
            user_id=user_id,
            username=user.email or user_id,
            password=data.new_password
        )
        return None
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schools/{school_id}/users", response_model=List[UserResponse])
def list_users(school_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    repository = SQLAlchemyUserRepository(db)
    use_case = ListUsersUseCase(repository)
    users = use_case.execute(school_id)
    # Map domain objects to primitive dicts for FastAPI serialization
    return [{
        "uid": u.uid,
        "name": u.name,
        "email": str(u.email) if u.email else None,
        "roles": [str(r) for r in u.roles]
    } for u in users]

@router.post("/schools/{school_id}/subjects", response_model=SubjectResponse, status_code=201)
def register_subject(school_id: str, subject_data: SubjectCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        repository = SQLAlchemySubjectRepository(db)
        use_case = RegisterSubjectUseCase(repository)
        use_case_input = RegisterSubjectInput(
            school_id=school_id, name=subject_data.name, level=subject_data.level,
            academic_units=subject_data.academic_units,
            offering_type=subject_data.offering_type, description=subject_data.description
        )
        result = use_case.execute(use_case_input)
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schools/{school_id}/subjects", response_model=List[SubjectResponse])
def list_subjects(school_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    repository = SQLAlchemySubjectRepository(db)
    use_case = ListSubjectsUseCase(repository)
    return use_case.execute(school_id)

@router.post("/schools/{school_id}/subject-offerings", response_model=SubjectOfferingResponse, status_code=201)
def create_subject_offering(school_id: str, offering_data: SubjectOfferingCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        repository = SQLAlchemySubjectOfferingRepository(db)
        use_case = CreateOfferingUseCase(repository)
        use_case_input = CreateOfferingInput(
            school_id=school_id, subject_id=offering_data.subject_id,
            period=offering_data.period, teacher_ids=offering_data.teacher_ids
        )
        result = use_case.execute(use_case_input)
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schools/{school_id}/subject-offerings", response_model=List[SubjectOfferingResponse])
def list_subject_offerings(school_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    repository = SQLAlchemySubjectOfferingRepository(db)
    use_case = ListOfferingsUseCase(repository)
    return use_case.execute(school_id)

@router.post("/schools/{school_id}/enrollments", response_model=EnrollmentResponse, status_code=201)
def create_enrollment(school_id: str, enrollment_data: EnrollmentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        repository = SQLAlchemyEnrollmentRepository(db)
        use_case = CreateEnrollmentUseCase(repository)
        use_case_input = CreateEnrollmentInput(
            school_id=school_id, student_id=enrollment_data.student_id,
            subject_offering_id=enrollment_data.subject_offering_id
        )
        result = use_case.execute(use_case_input)
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/schools/{school_id}/enrollments/{enrollment_id}/grades", status_code=204)
def post_grade(school_id: str, enrollment_id: str, grade_data: GradePostRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        repository = SQLAlchemyEnrollmentRepository(db)
        policy = SubstitutionRecoveryPolicy() 
        use_case = PostGradeUseCase(repository, policy)
        use_case_input = PostGradeInput(
            enrollment_id=enrollment_id, term=grade_data.term,
            value=grade_data.value, grade_type=grade_data.grade_type
        )
        use_case.execute(use_case_input)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/schools/{school_id}/class-groups", response_model=ClassGroupResponse, status_code=201)
def create_class_group(school_id: str, group_data: ClassGroupCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        repository = SQLAlchemyClassGroupRepository(db)
        use_case = CreateGroupUseCase(repository)
        use_case_input = CreateGroupInput(
            school_id=school_id, name=group_data.name, shift=group_data.shift,
            base_offering_ids=group_data.base_offering_ids
        )
        result = use_case.execute(use_case_input)
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/schools/{school_id}/class-groups/{group_id}/enroll-student", status_code=204)
def enroll_student_in_group(school_id: str, group_id: str, request: EnrollStudentInGroupRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        user_repo = SQLAlchemyUserRepository(db)
        class_repo = SQLAlchemyClassGroupRepository(db)
        enroll_repo = SQLAlchemyEnrollmentRepository(db)
        use_case = EnrollStudentUseCase(user_repo, class_repo, enroll_repo)
        use_case_input = EnrollStudentInput(
            student_id=request.student_id, class_group_id=group_id
        )
        use_case.execute(use_case_input)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schools/{school_id}/class-groups/{group_id}/offerings/{offering_id}/report", response_model=ClassReportResponse)
def get_class_report(school_id: str, group_id: str, offering_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user), _ = Depends(verify_school_access)):
    try:
        class_repo = SQLAlchemyClassGroupRepository(db)
        enroll_repo = SQLAlchemyEnrollmentRepository(db)
        user_repo = SQLAlchemyUserRepository(db)
        use_case = GetClassGradesReportUseCase(class_repo, enroll_repo, user_repo)
        return use_case.execute(group_id, offering_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
def get_status():
    return {"status": "ok", "message": "TraceEdu Multi-tenant API operating normally!"}
