import pytest
from app.domain.subject.entities.subject import Subject

def test_subject_creation():
    subject = Subject(uid="s1", school_id="sc1", name="Math", level="High School", academic_units=4, offering_type="in-person")
    assert subject.name == "Math"
    assert subject.school_id == "sc1"

def test_subject_should_raise_error_with_zero_units():
    # Placeholder for validation logic if we add it to the entity later
    pass

def test_subject_should_raise_error_with_empty_name():
    # Placeholder for validation logic
    pass
