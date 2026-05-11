import pytest
from app.domain.user.value_objects import Email
from app.domain.exceptions import DomainException

def test_email_should_be_created_with_valid_address():
    email = Email("gabriel@example.com")
    assert email.value == "gabriel@example.com"

def test_email_should_raise_error_with_invalid_format():
    invalid_emails = ["gabriel", "gabriel@", "@example.com", "gabriel@example", "gabriel.com"]
    for address in invalid_emails:
        with pytest.raises(DomainException):
            Email(address)

def test_email_equality():
    assert Email("test@test.com") == Email("test@test.com")
    assert Email("test@test.com") != Email("other@test.com")
