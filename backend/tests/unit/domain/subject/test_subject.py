import pytest
from uuid import uuid4
from app.domain.subject.entities.subject import Subject
from app.domain.subject.value_objects import SubjectLevel, OfferingType
from app.domain.exceptions import DomainException

def test_subject_should_be_created_with_valid_data():
    uid = str(uuid4())
    name = "Matemática"
    subject = Subject(
        uid=uid,
        name=name,
        level=SubjectLevel.ELEMENTARY_2,
        academic_units=4,
        offering_type=OfferingType.IN_PERSON
    )
    
    assert subject.uid == uid
    assert subject.name == name
    assert subject.academic_units == 4

def test_subject_should_raise_error_with_zero_units():
    with pytest.raises(DomainException) as excinfo:
        Subject(
            uid=str(uuid4()),
            name="Test",
            level=SubjectLevel.HIGH_SCHOOL,
            academic_units=0,
            offering_type=OfferingType.ONLINE
        )
    assert "Academic units must be at least 1" in str(excinfo.value)

def test_subject_should_raise_error_with_empty_name():
    with pytest.raises(DomainException) as excinfo:
        Subject(
            uid=str(uuid4()),
            name="",
            level=SubjectLevel.HIGH_SCHOOL,
            academic_units=4,
            offering_type=OfferingType.ONLINE
        )
    assert "Subject name cannot be empty" in str(excinfo.value)
