import pytest
from unittest.mock import Mock
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.user.value_objects import UserRole
from app.domain.exceptions import DomainException

def test_register_user_successfully():
    # Arrange
    repository = Mock(spec=UserRepository)
    # Important: ensure get_by_cpf returns None to simulate new user
    repository.get_by_cpf.return_value = None
    
    use_case = RegisterUserUseCase(repository)
    
    user_input = RegisterUserInput(
        name="Gabriel Neto",
        roles=["student"],
        email="gabriel@example.com",
        cpf="123.456.789-09"
    )
    
    # Act
    output = use_case.execute(user_input)
    
    # Assert
    assert output.name == "Gabriel Neto"
    assert output.uid is not None
    
    # Verify repository was called
    repository.save.assert_called_once()

def test_register_user_duplicate_cpf_fails():
    # Arrange
    repository = Mock(spec=UserRepository)
    # Simulate existing user
    repository.get_by_cpf.return_value = Mock()
    
    use_case = RegisterUserUseCase(repository)
    user_input = RegisterUserInput(name="John", roles=["student"], cpf="12345678909")
    
    # Act & Assert
    with pytest.raises(DomainException) as excinfo:
        use_case.execute(user_input)
    assert "already exists" in str(excinfo.value)
