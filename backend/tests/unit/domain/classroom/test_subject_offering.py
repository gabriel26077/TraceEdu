import pytest
from uuid import uuid4
from app.domain.classroom.entities.subject_offering import SubjectOffering
from app.domain.subject.value_objects import AcademicPeriod
from app.domain.exceptions import DomainException

def test_subject_offering_should_be_created_with_valid_data():
    uid = str(uuid4())
    subject_id = str(uuid4())
    teacher_id = str(uuid4())
    period = AcademicPeriod("2026.1")
    
    offering = SubjectOffering(
        uid=uid,
        subject_id=subject_id,
        teacher_ids=[teacher_id],
        period=period
    )
    
    assert offering.uid == uid
    assert offering.period == period
    assert teacher_id in offering.teacher_ids

def test_subject_offering_should_raise_error_without_teachers():
    with pytest.raises(DomainException) as excinfo:
        SubjectOffering(
            uid=str(uuid4()),
            subject_id=str(uuid4()),
            teacher_ids=[],
            period=AcademicPeriod("2026.1")
        )
    assert "At least one teacher is required" in str(excinfo.value)

def test_add_teacher_to_offering():
    offering = SubjectOffering(
        uid=str(uuid4()),
        subject_id=str(uuid4()),
        teacher_ids=[str(uuid4())],
        period=AcademicPeriod("2026.1")
    )
    new_teacher_id = str(uuid4())
    offering.add_teacher(new_teacher_id)
    assert new_teacher_id in offering.teacher_ids
