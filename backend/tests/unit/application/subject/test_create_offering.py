import pytest
from unittest.mock import Mock
from app.application.subject.create_offering_use_case import CreateOfferingUseCase, CreateOfferingInput
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository

def test_create_offering_successfully():
    repo = Mock(spec=SubjectOfferingRepository)
    use_case = CreateOfferingUseCase(repo)
    input_data = CreateOfferingInput(school_id="s1", subject_id="sub1", period="2026.1", teacher_ids=["t1"])
    
    offering = use_case.execute(input_data)
    assert offering.period == "2026.1"
    assert offering.school_id == "s1"
    assert repo.save.called
