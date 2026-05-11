import pytest
from unittest.mock import Mock
from app.application.enrollment.create_enrollment_use_case import CreateEnrollmentUseCase, CreateEnrollmentInput
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository

def test_create_enrollment_successfully():
    # Arrange
    repository = Mock(spec=EnrollmentRepository)
    use_case = CreateEnrollmentUseCase(repository)
    
    input_data = CreateEnrollmentInput(
        student_id="student-123",
        subject_offering_id="offering-456"
    )
    
    # Act
    output = use_case.execute(input_data)
    
    # Assert
    assert output.student_id == "student-123"
    assert output.subject_offering_id == "offering-456"
    assert output.status == "enrolled"
    repository.save.assert_called_once()
