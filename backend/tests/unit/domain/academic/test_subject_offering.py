import pytest
from app.domain.academic.entities.subject_offering import SubjectOffering

def test_subject_offering_creation():
    offering = SubjectOffering(uid="o1", school_id="sc1", subject_id="s1", period="2026.1")
    assert offering.period == "2026.1"
    assert offering.school_id == "sc1"
