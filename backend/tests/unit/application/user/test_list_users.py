import pytest
from unittest.mock import Mock
from app.application.user.list_users_use_case import ListUsersUseCase
from app.domain.user.repositories.user_repository import UserRepository

def test_list_users_by_school():
    repository = Mock(spec=UserRepository)
    repository.list_by_school.return_value = []
    
    use_case = ListUsersUseCase(repository)
    result = use_case.execute("sc1")
    
    repository.list_by_school.assert_called_with("sc1")
    assert isinstance(result, list)
