from dataclasses import dataclass
from typing import Optional, List
from uuid import uuid4
from app.domain.school.entities.school import School
from app.domain.school.entities.membership import SchoolMember
from app.domain.school.repositories.school_repository import SchoolRepository
from app.domain.school.repositories.membership_repository import SchoolMemberRepository
from app.domain.user.entities.user import User
from app.domain.user.repositories.user_repository import UserRepository
from app.infrastructure.database.models import AccountModel
from app.infrastructure.security.auth_service import AuthService
from sqlalchemy.orm import Session

@dataclass
class RegisterSchoolInput:
    name: str
    coordination_email: str
    admin_name: str
    admin_email: str
    admin_password: str
    admin_cpf: Optional[str] = None

@dataclass
class RegisterSchoolOutput:
    school_id: str
    admin_id: str
    membership_id: str

class RegisterSchoolUseCase:
    def __init__(self, db: Session, school_repo: SchoolRepository, user_repo: UserRepository, member_repo: SchoolMemberRepository):
        self.db = db
        self.school_repo = school_repo
        self.user_repo = user_repo
        self.member_repo = member_repo
        self.auth_service = AuthService()

    def execute(self, input: RegisterSchoolInput) -> RegisterSchoolOutput:
        # 1. Create School
        school = School(
            uid=str(uuid4()),
            name=input.name,
            coordination_email=input.coordination_email
        )
        
        # 2. Create Global User
        admin_cpf = input.admin_cpf.strip() if input.admin_cpf else None
        if not admin_cpf: admin_cpf = None

        admin = User(
            uid=str(uuid4()),
            name=input.admin_name,
            email=input.admin_email,
            cpf=admin_cpf
        )
        
        # 3. Create Account (for login)
        password_hash = self.auth_service.get_password_hash(input.admin_password)
        account = AccountModel(
            uid=str(uuid4()),
            user_id=admin.uid,
            username=input.admin_email, # Use email as username
            password_hash=password_hash
        )
        
        # 4. Create Membership
        membership = SchoolMember(
            uid=str(uuid4()),
            school_id=school.uid,
            user_id=admin.uid,
            roles=["admin"]
        )
        
        # 5. Save everything
        self.school_repo.save(school)
        self.user_repo.save(admin)
        self.member_repo.save(membership)
        self.db.add(account) # Save the account model
        
        return RegisterSchoolOutput(
            school_id=school.uid,
            admin_id=admin.uid,
            membership_id=membership.uid
        )
