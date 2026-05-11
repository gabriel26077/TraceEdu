from dataclasses import dataclass
from typing import List
from app.domain.user.repositories.user_repository import UserRepository
from .register_user_use_case import RegisterUserOutput

class ListUsersUseCase:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def execute(self) -> List[RegisterUserOutput]:
        users = self.user_repository.get_all()
        return [
            RegisterUserOutput(
                uid=user.uid,
                name=user.name,
                roles=[role.value for role in user.roles],
                email=str(user.email) if user.email else None,
                cpf=user.cpf.value if user.cpf else None
            ) for user in users
        ]