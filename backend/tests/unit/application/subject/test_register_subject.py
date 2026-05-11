import pytest
from unittest.mock import Mock
from app.application.subject.register_subject_use_case import RegisterSubjectUseCase, RegisterSubjectInput
from app.domain.subject.repositories.subject_repository import SubjectRepository

def test_register_subject_successfully():
    # Arrange
    repository = Mock(spec=SubjectRepository)
    use_case = RegisterSubjectUseCase(repository)
    
    input_data = RegisterSubjectInput(
        name="Matemática",
        level="Elementary 2",
        academic_units=4,
        offering_type="in-person"
    )
    
    # Act
    output = use_case.execute(input_data)
    
    # Assert
    assert output.name == "Matemática"
    assert output.level == "Elementary 2"
    assert output.academic_units == 4
    repository.save.assert_called_once()

def test_register_subject_invalid_level_fails():
    # Arrange
    repository = Mock(spec=SubjectRepository)
    use_case = RegisterSubjectUseCase(repository)
    
    # Invalid level string
    input_data = RegisterSubjectInput(
        name="Test",
        level="Invalid Level",
        academic_units=4,
        offering_type="online"
    )
    
    # Act & Assert
    with pytest.raises(ValueError): # SubjectLevel enum will raise ValueError
        use_case.execute(input_data)
