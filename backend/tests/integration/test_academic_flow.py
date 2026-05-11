import pytest
from sqlalchemy.orm import sessionmaker
from app.infrastructure.database.models import Base
from app.infrastructure.database.session import get_db
from app.infrastructure.persistence.postgresql import (
    SQLAlchemyUserRepository,
    SQLAlchemySubjectRepository,
    SQLAlchemySubjectOfferingRepository,
    SQLAlchemyClassGroupRepository,
    SQLAlchemyEnrollmentRepository
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
    # 1. Create Student and Teacher
    user_repo = SQLAlchemyUserRepository(db_session)
    register_user = RegisterUserUseCase(user_repo)
    student = register_user.execute(RegisterUserInput(name="John Doe", roles=["student"]))
    teacher = register_user.execute(RegisterUserInput(name="Professor X", roles=["teacher"]))
    
    # 2. Create Subject
    subject_repo = SQLAlchemySubjectRepository(db_session)
    register_subject = RegisterSubjectUseCase(subject_repo)
    subject = register_subject.execute(RegisterSubjectInput(
        name="Math", level="High School", academic_units=4, offering_type="in-person"
    ))
    
    # 3. Create Subject Offering (With Teacher)
    offering_repo = SQLAlchemySubjectOfferingRepository(db_session)
    create_offering = CreateOfferingUseCase(offering_repo)
    offering = create_offering.execute(CreateOfferingInput(
        subject_id=subject.uid, period="2026.1", teacher_ids=[teacher.uid]
    ))
    
    # 4. Create Class Group with the Offering
    group_repo = SQLAlchemyClassGroupRepository(db_session)
    create_group = CreateGroupUseCase(group_repo)
    group = create_group.execute(CreateGroupInput(
        name="7A", shift="morning", base_offering_ids=[offering.uid]
    ))
    
    # 5. Enroll Student in Group (The Orchestration)
    enroll_repo = SQLAlchemyEnrollmentRepository(db_session)
    enroll_student_in_group = EnrollStudentUseCase(user_repo, group_repo, enroll_repo)
    enroll_student_in_group.execute(EnrollStudentInput(
        student_id=student.uid, class_group_id=group.uid
    ))
    
    # 6. VERIFICATION: Does the student have a math enrollment?
    # We check directly in the enrollment repository
    enrollments = db_session.query(Base.metadata.tables['enrollments']).filter_by(student_id=student.uid).all()
    
    assert len(enrollments) == 1
    assert enrollments[0].subject_offering_id == offering.uid
    
    # Verify student is in the group
    saved_group = group_repo.get_by_id(group.uid)
    assert student.uid in saved_group.student_ids
