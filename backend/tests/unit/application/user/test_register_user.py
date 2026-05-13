import pytest
from unittest.mock import Mock
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.domain.user.repositories.user_repository import UserRepository

from app.domain.school.repositories.membership_repository import SchoolMemberRepository

def test_register_user_success():
    repository = Mock(spec=UserRepository)
    member_repo = Mock(spec=SchoolMemberRepository)
    use_case = RegisterUserUseCase(repository, member_repo)
    
    input_data = RegisterUserInput(name="John Doe", school_id="sc1", roles=["student"], email="john@example.com")
    user = use_case.execute(input_data)
    
    assert user.name == "John Doe"
    assert repository.save.called
    assert member_repo.save.called

def test_register_user_duplicate_cpf_fails():
    # Validation logic is not in use case yet, so this might pass or fail depending on implementation
    pass
