import pytest
from app.domain.subject.value_objects import AcademicPeriod
from app.domain.exceptions import DomainException

def test_academic_period_should_be_created_with_year_and_semester():
    period = AcademicPeriod("2026.1")
    assert period.value == "2026.1"

def test_academic_period_should_be_created_with_only_year():
    period = AcademicPeriod("2026")
    assert period.value == "2026"

def test_academic_period_should_raise_error_with_invalid_format():
    invalid_periods = ["202", "2026.a", "abcd", "2026.1.2"]
    for p in invalid_periods:
        with pytest.raises(DomainException):
            AcademicPeriod(p)

def test_academic_period_equality():
    assert AcademicPeriod("2026.1") == AcademicPeriod("2026.1")
    assert AcademicPeriod("2026.1") != AcademicPeriod("2026.2")
