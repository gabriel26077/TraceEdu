import pytest
from app.domain.user.value_objects import UserRole

def test_user_role_values():
    assert UserRole.STUDENT.value == "student"
    assert UserRole.TEACHER.value == "teacher"
    assert UserRole.ADMIN.value == "admin"
    assert UserRole.CLERK.value == "clerk"

def test_user_role_from_string():
    assert UserRole("student") == UserRole.STUDENT
    assert UserRole("clerk") == UserRole.CLERK

def test_invalid_user_role():
    with pytest.raises(ValueError):
        UserRole("invalid_role")
