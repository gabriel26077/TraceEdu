import pytest
from unittest.mock import Mock
from app.application.enrollment.create_enrollment_use_case import CreateEnrollmentUseCase, CreateEnrollmentInput
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository

def test_create_enrollment_successfully():
    repo = Mock(spec=EnrollmentRepository)
    use_case = CreateEnrollmentUseCase(repo)
    input_data = CreateEnrollmentInput(school_id="s1", student_id="u1", subject_offering_id="o1")
    
    enrollment = use_case.execute(input_data)
    assert enrollment.school_id == "s1"
    assert repo.save.called
