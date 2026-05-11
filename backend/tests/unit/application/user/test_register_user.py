import pytest
from unittest.mock import Mock
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.user.value_objects import UserRole

def test_register_user_successfully():
    # Arrange
    repository = Mock(spec=UserRepository)
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
    assert "student" in output.roles
    
    # Verify repository was called
    repository.save.assert_called_once()
    saved_user = repository.save.call_args[0][0]
    assert saved_user.name == "Gabriel Neto"

def test_register_user_with_invalid_data_should_fail():
    # Arrange
    repository = Mock(spec=UserRepository)
    use_case = RegisterUserUseCase(repository)
    
    # Empty name (invalid at domain level)
    user_input = RegisterUserInput(name="", roles=["student"])
    
    # Act & Assert
    with pytest.raises(Exception): # Will be DomainException
        use_case.execute(user_input)
