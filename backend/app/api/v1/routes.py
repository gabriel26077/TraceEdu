from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.database.session import get_db
from app.infrastructure.persistence.postgresql.user_repository import SQLAlchemyUserRepository
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.application.user.list_users_use_case import ListUsersUseCase
from .schemas import UserCreate, UserResponse

router = APIRouter()

@router.post("/users", response_model=UserResponse, status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemyUserRepository(db)
        use_case = RegisterUserUseCase(repository)
        
        use_case_input = RegisterUserInput(
            name=user_data.name,
            roles=user_data.roles,
            email=user_data.email,
            cpf=user_data.cpf
        )
        
        return use_case.execute(use_case_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemyUserRepository(db)
        use_case = ListUsersUseCase(repository)
        return use_case.execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_status():
    return {"status": "ok", "message": "TraceEdu API operating normally with Hexagonal Architecture!"}

from app.infrastructure.persistence.postgresql.subject_repository import SQLAlchemySubjectRepository
from app.application.subject.register_subject_use_case import RegisterSubjectUseCase, RegisterSubjectInput
from app.application.subject.list_subjects_use_case import ListSubjectsUseCase
from .schemas import SubjectCreate, SubjectResponse

@router.post("/subjects", response_model=SubjectResponse, status_code=201)
def register_subject(subject_data: SubjectCreate, db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemySubjectRepository(db)
        use_case = RegisterSubjectUseCase(repository)
        
        use_case_input = RegisterSubjectInput(
            name=subject_data.name,
            level=subject_data.level,
            academic_units=subject_data.academic_units,
            offering_type=subject_data.offering_type,
            description=subject_data.description
        )
        
        return use_case.execute(use_case_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subjects", response_model=List[SubjectResponse])
def list_subjects(db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemySubjectRepository(db)
        use_case = ListSubjectsUseCase(repository)
        return use_case.execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.domain.classroom.repositories.classroom_repository import SubjectOfferingRepository
from app.application.subject.create_offering_use_case import CreateOfferingUseCase, CreateOfferingInput
from .schemas import SubjectOfferingCreate, SubjectOfferingResponse

@router.post("/subject-offerings", response_model=SubjectOfferingResponse, status_code=201)
def create_subject_offering(offering_data: SubjectOfferingCreate, db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemySubjectOfferingRepository(db)
        use_case = CreateOfferingUseCase(repository)
        
        use_case_input = CreateOfferingInput(
            subject_id=offering_data.subject_id,
            period=offering_data.period,
            teacher_ids=offering_data.teacher_ids
        )
        
        return use_case.execute(use_case_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.infrastructure.persistence.postgresql.enrollment_repository import SQLAlchemyEnrollmentRepository
from app.application.enrollment.create_enrollment_use_case import CreateEnrollmentUseCase, CreateEnrollmentInput
from .schemas import EnrollmentCreate, EnrollmentResponse

@router.post("/enrollments", response_model=EnrollmentResponse, status_code=201)
def create_enrollment(enrollment_data: EnrollmentCreate, db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemyEnrollmentRepository(db)
        use_case = CreateEnrollmentUseCase(repository)
        
        use_case_input = CreateEnrollmentInput(
            student_id=enrollment_data.student_id,
            subject_offering_id=enrollment_data.subject_offering_id
        )
        
        return use_case.execute(use_case_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.infrastructure.persistence.postgresql.classroom_repository import SQLAlchemyClassGroupRepository
from app.application.classroom.create_group_use_case import CreateGroupUseCase, CreateGroupInput
from app.application.classroom.enroll_student_use_case import EnrollStudentUseCase, EnrollStudentInput
from .schemas import ClassGroupCreate, ClassGroupResponse, EnrollStudentInGroupRequest

@router.post("/class-groups", response_model=ClassGroupResponse, status_code=201)
def create_class_group(group_data: ClassGroupCreate, db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemyClassGroupRepository(db)
        use_case = CreateGroupUseCase(repository)
        
        use_case_input = CreateGroupInput(
            name=group_data.name,
            shift=group_data.shift,
            base_offering_ids=group_data.base_offering_ids
        )
        
        return use_case.execute(use_case_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/class-groups/{group_id}/enroll-student", status_code=204)
def enroll_student_in_group(group_id: str, request: EnrollStudentInGroupRequest, db: Session = Depends(get_db)):
    try:
        # Repositories needed for the use case
        user_repo = SQLAlchemyUserRepository(db)
        class_repo = SQLAlchemyClassGroupRepository(db)
        enroll_repo = SQLAlchemyEnrollmentRepository(db)
        
        use_case = EnrollStudentUseCase(user_repo, class_repo, enroll_repo)
        
        use_case_input = EnrollStudentInput(
            student_id=request.student_id,
            class_group_id=group_id
        )
        
        use_case.execute(use_case_input)
        return None
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
