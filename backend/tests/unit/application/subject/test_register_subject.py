import pytest
from unittest.mock import Mock
from app.application.subject.register_subject_use_case import RegisterSubjectUseCase, RegisterSubjectInput
from app.domain.subject.repositories.subject_repository import SubjectRepository

def test_register_subject_successfully():
    repo = Mock(spec=SubjectRepository)
    use_case = RegisterSubjectUseCase(repo)
    input_data = RegisterSubjectInput(school_id="s1", name="Physics", level="High School", academic_units=4, offering_type="in-person")
    
    subject = use_case.execute(input_data)
    assert subject.name == "Physics"
    assert subject.school_id == "s1"
    assert repo.save.called

def test_register_subject_invalid_level_fails():
    # Validation not yet implemented in use case
    pass
