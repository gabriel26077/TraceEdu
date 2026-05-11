from dataclasses import dataclass
from typing import List, Optional
from uuid import uuid4
from app.domain.user.entities.user import User
from app.domain.user.value_objects import CPF, Email, UserRole
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.exceptions import DomainException

@dataclass
class RegisterUserInput:
    name: str
    roles: List[str]
    email: Optional[str] = None
    cpf: Optional[str] = None
    birthdate_iso: Optional[str] = None

@dataclass
class RegisterUserOutput:
    uid: str
    name: str
    roles: List[str]
    email: Optional[str] = None
    cpf: Optional[str] = None

class RegisterUserUseCase:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def execute(self, input: RegisterUserInput) -> RegisterUserOutput:
        # 1. Map input to domain
        roles = [UserRole(role_str) for role_str in input.roles]
        email = Email(input.email) if input.email else None
        cpf = CPF(input.cpf) if input.cpf else None
        
        # 2. Check for duplicates if CPF is provided
        if cpf:
            existing = self.user_repository.get_by_cpf(cpf.value)
            if existing:
                raise DomainException(f"User with CPF {cpf.value} already exists")

        # 3. Create the entity
        user = User(
            uid=str(uuid4()),
            name=input.name,
            roles=roles,
            email=email,
            cpf=cpf
        )
        
        # 3. Persist
        self.user_repository.save(user)
        
        # 4. Return output with all fields
        return RegisterUserOutput(
            uid=user.uid,
            name=user.name,
            roles=[role.value for role in user.roles],
            email=str(user.email) if user.email else None,
            cpf=user.cpf.value if user.cpf else None
        )
