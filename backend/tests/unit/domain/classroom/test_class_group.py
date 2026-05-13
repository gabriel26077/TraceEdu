import pytest
from app.domain.classroom.entities.class_group import ClassGroup

def test_class_group_creation():
    group = ClassGroup(uid="g1", school_id="sc1", name="7A", shift="morning")
    assert group.name == "7A"
    assert group.school_id == "sc1"
