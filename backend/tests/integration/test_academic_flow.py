import pytest
from sqlalchemy.orm import sessionmaker
from app.infrastructure.database.models import Base
from app.infrastructure.database.session import get_db
from app.infrastructure.persistence.postgresql import (
    SQLAlchemyUserRepository,
    SQLAlchemySubjectRepository,
    SQLAlchemySubjectOfferingRepository,
    SQLAlchemyClassGroupRepository,
    SQLAlchemyEnrollmentRepository,
    SQLAlchemySchoolRepository,
    SQLAlchemySchoolMemberRepository
)
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.application.subject.register_subject_use_case import RegisterSubjectUseCase, RegisterSubjectInput
from app.application.subject.create_offering_use_case import CreateOfferingUseCase, CreateOfferingInput
from app.application.classroom.create_group_use_case import CreateGroupUseCase, CreateGroupInput
from app.application.classroom.enroll_student_use_case import EnrollStudentUseCase, EnrollStudentInput

@pytest.fixture
def db_session():
    # Use SQLite in-memory for integration tests
    from sqlalchemy import create_engine
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_complete_academic_flow(db_session):
    # 1. Setup School
    school_repo = SQLAlchemySchoolRepository(db_session)
    from app.domain.school.entities.school import School
    school = School(uid="sc1", name="Test School", coordination_email="test@school.com")
    school_repo.save(school)

    # 2. Create Student and Teacher
    user_repo = SQLAlchemyUserRepository(db_session)
    member_repo = SQLAlchemySchoolMemberRepository(db_session)
    register_user = RegisterUserUseCase(user_repo, member_repo)
    student = register_user.execute(RegisterUserInput(name="John Doe", school_id=school.uid, roles=["student"]))
    teacher = register_user.execute(RegisterUserInput(name="Professor X", school_id=school.uid, roles=["teacher"]))
    
    # 3. Create Subject
    subject_repo = SQLAlchemySubjectRepository(db_session)
    register_subject = RegisterSubjectUseCase(subject_repo)
    subject = register_subject.execute(RegisterSubjectInput(
        school_id=school.uid, name="Math", level="High School", academic_units=4, offering_type="in-person"
    ))
    
    # 4. Create Subject Offering (With Teacher)
    offering_repo = SQLAlchemySubjectOfferingRepository(db_session)
    create_offering = CreateOfferingUseCase(offering_repo)
    offering = create_offering.execute(CreateOfferingInput(
        school_id=school.uid, subject_id=subject.uid, period="2026.1", teacher_ids=[teacher.uid]
    ))
    
    # 5. Create Class Group with the Offering
    group_repo = SQLAlchemyClassGroupRepository(db_session)
    create_group = CreateGroupUseCase(group_repo)
    group = create_group.execute(CreateGroupInput(
        school_id=school.uid, name="7A", shift="morning", base_offering_ids=[offering.uid]
    ))
    
    # 6. Enroll Student in Group
    enroll_repo = SQLAlchemyEnrollmentRepository(db_session)
    enroll_student_in_group = EnrollStudentUseCase(user_repo, group_repo, enroll_repo)
    enroll_student_in_group.execute(EnrollStudentInput(
        student_id=student.uid, class_group_id=group.uid
    ))
    
    # 6. Post a Grade for that Student
    # Find the enrollment first
    enrollment = enroll_repo.get_by_student_and_offering(student.uid, offering.uid)
    from app.application.enrollment.post_grade_use_case import PostGradeUseCase, PostGradeInput
    from app.domain.enrollment.policies import SubstitutionRecoveryPolicy
    post_grade = PostGradeUseCase(enroll_repo, SubstitutionRecoveryPolicy())
    post_grade.execute(PostGradeInput(
        enrollment_id=enrollment.uid, term=1, value=9.5, grade_type="regular"
    ))
    
    # 7. Generate Class Report
    from app.application.classroom.get_class_report_use_case import GetClassGradesReportUseCase
    get_report = GetClassGradesReportUseCase(group_repo, enroll_repo, user_repo)
    report = get_report.execute(group.uid, offering.uid)
    
    # 8. VERIFICATION
    assert report.group_name == "7A"
    assert len(report.students) == 1
    assert report.students[0].student_name == "John Doe"
    # In integration test, student should be enrolled
    from app.domain.enrollment.entities.enrollment import EnrollmentStatus
    assert report.students[0].enrollment_status == EnrollmentStatus.ENROLLED
    assert report.students[0].grades[0]["value"] == 9.5
