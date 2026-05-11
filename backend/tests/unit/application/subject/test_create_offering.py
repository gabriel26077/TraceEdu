import pytest
from unittest.mock import Mock
from app.application.subject.create_offering_use_case import CreateOfferingUseCase, CreateOfferingInput
from app.domain.classroom.repositories.classroom_repository import SubjectOfferingRepository

def test_create_offering_successfully():
    # Arrange
    repository = Mock(spec=SubjectOfferingRepository)
    use_case = CreateOfferingUseCase(repository)
    
    input_data = CreateOfferingInput(
        subject_id="sub-123",
        period="2026.1",
        teacher_ids=["teacher-456"]
    )
    
    # Act
    output = use_case.execute(input_data)
    
    # Assert
    assert output.subject_id == "sub-123"
    assert output.period == "2026.1"
    assert "teacher-456" in output.teacher_ids
    repository.save.assert_called_once()
