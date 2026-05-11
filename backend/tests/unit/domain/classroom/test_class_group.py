import pytest
from uuid import uuid4
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.value_objects import Shift
from app.domain.exceptions import DomainException

def test_class_group_should_be_created_with_valid_data():
    uid = str(uuid4())
    name = "7º Ano A"
    group = ClassGroup(uid=uid, name=name, shift=Shift.MORNING)
    
    assert group.uid == uid
    assert group.name == name
    assert group.shift == Shift.MORNING
    assert len(group.student_ids) == 0

def test_add_student_to_group():
    group = ClassGroup(uid=str(uuid4()), name="7A", shift=Shift.MORNING)
    student_id = str(uuid4())
    
    group.add_student(student_id)
    assert student_id in group.student_ids

def test_add_subject_offering_to_group():
    group = ClassGroup(uid=str(uuid4()), name="7A", shift=Shift.MORNING)
    offering_id = str(uuid4())
    
    group.add_base_subject(offering_id)
    assert offering_id in group.base_subject_offering_ids

def test_class_group_should_raise_error_with_empty_name():
    with pytest.raises(DomainException):
        ClassGroup(uid=str(uuid4()), name="", shift=Shift.MORNING)
