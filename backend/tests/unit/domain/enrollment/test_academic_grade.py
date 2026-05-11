import pytest
from app.domain.enrollment.value_objects import AcademicGrade
from app.domain.exceptions import DomainException

def test_academic_grade_should_be_created_with_valid_value():
    # Arrange & Act
    grade = AcademicGrade(7.5)
    
    # Assert
    assert grade.value == 7.5

def test_academic_grade_should_raise_error_when_value_is_less_than_zero():
    with pytest.raises(DomainException) as excinfo:
        AcademicGrade(-0.1)
    assert "Grade must be between 0 and 10" in str(excinfo.value)

def test_academic_grade_should_raise_error_when_value_is_greater_than_ten():
    with pytest.raises(DomainException) as excinfo:
        AcademicGrade(10.1)
    assert "Grade must be between 0 and 10" in str(excinfo.value)

def test_academic_grade_equality():
    grade1 = AcademicGrade(8.0)
    grade2 = AcademicGrade(8.0)
    grade3 = AcademicGrade(9.0)
    
    assert grade1 == grade2
    assert grade1 != grade3

def test_academic_grade_is_immutable():
    grade = AcademicGrade(8.0)
    with pytest.raises(AttributeError):
        grade.value = 9.0
