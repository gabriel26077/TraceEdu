from dataclasses import dataclass
from typing import List, Optional
from app.domain.user.entities.user import User
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.school.entities.membership import SchoolMember
from app.domain.school.repositories.membership_repository import SchoolMemberRepository

@dataclass
class RegisterUserInput:
    name: str
    school_id: str
    roles: List[str]
    email: Optional[str] = None
    cpf: Optional[str] = None
    birthdate: Optional[str] = None

import uuid

class RegisterUserUseCase:
    def __init__(self, repository: UserRepository, member_repo: SchoolMemberRepository):
        self.repository = repository
        self.member_repo = member_repo

    def execute(self, input: RegisterUserInput) -> User:
        user = User(
            uid=str(uuid.uuid4()),
            name=input.name,
            email=input.email,
            cpf=input.cpf,
            birthdate=input.birthdate
        )
        self.repository.save(user)
        
        # Create membership link
        membership = SchoolMember(
            uid=str(uuid.uuid4()),
            school_id=input.school_id,
            user_id=user.uid,
            roles=input.roles
        )
        self.member_repo.save(membership)
        
        return user
