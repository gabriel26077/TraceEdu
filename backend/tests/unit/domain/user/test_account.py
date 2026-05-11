import pytest
from uuid import uuid4
from app.domain.user.entities.account import Account
from app.domain.exceptions import DomainException

def test_account_should_be_created_with_valid_data():
    uid = str(uuid4())
    user_id = str(uuid4())
    username = "gabriel.2026"
    password_hash = "hashed_password_123"
    
    account = Account(
        uid=uid,
        user_id=user_id,
        username=username,
        password_hash=password_hash
    )
    
    assert account.uid == uid
    assert account.username == username
    assert account.status == "active"

def test_account_should_raise_error_with_empty_username():
    with pytest.raises(DomainException) as excinfo:
        Account(
            uid=str(uuid4()),
            user_id=str(uuid4()),
            username="",
            password_hash="hash"
        )
    assert "Username cannot be empty" in str(excinfo.value)

def test_account_deactivation():
    account = Account(
        uid=str(uuid4()),
        user_id=str(uuid4()),
        username="test",
        password_hash="hash"
    )
    account.deactivate()
    assert account.status == "inactive"
    
    account.activate()
    assert account.status == "active"
