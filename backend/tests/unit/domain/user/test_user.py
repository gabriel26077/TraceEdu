import pytest
from uuid import uuid4
from datetime import date
from app.domain.user.entities.user import User
from app.domain.user.value_objects import CPF, Email, UserRole
from app.domain.exceptions import DomainException

def test_user_should_be_created_with_valid_data():
    # Arrange
    uid = str(uuid4())
    name = "Gabriel Neto"
    roles = [UserRole.ADMIN]
    
    # Act
    user = User(uid=uid, name=name, roles=roles)
    
    # Assert
    assert user.uid == uid
    assert user.name == name
    assert UserRole.ADMIN in user.roles
    assert user.email is None
    assert user.cpf is None

def test_user_creation_with_all_fields():
    # Arrange
    uid = str(uuid4())
    email = Email("test@test.com")
    cpf = CPF("12345678909")
    birthdate = date(1990, 1, 1)
    roles = [UserRole.STUDENT, UserRole.TEACHER]
    
    # Act
    user = User(
        uid=uid, 
        name="John Doe", 
        roles=roles,
        email=email,
        cpf=cpf,
        birthdate=birthdate
    )
    
    # Assert
    assert user.email == email
    assert user.cpf == cpf
    assert user.birthdate == birthdate
    assert len(user.roles) == 2

def test_user_should_raise_error_without_roles():
    with pytest.raises(DomainException) as excinfo:
        User(uid=str(uuid4()), name="No Roles", roles=[])
    assert "User must have at least one role" in str(excinfo.value)

def test_user_should_raise_error_with_empty_name():
    with pytest.raises(DomainException) as excinfo:
        User(uid=str(uuid4()), name=" ", roles=[UserRole.STUDENT])
    assert "Name cannot be empty" in str(excinfo.value)
