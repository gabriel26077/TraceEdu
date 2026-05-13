from dataclasses import dataclass
from typing import Optional, List
from app.infrastructure.security.auth_service import AuthService
from app.domain.user.repositories.user_repository import UserRepository
from app.infrastructure.database.models import AccountModel
from sqlalchemy.orm import Session

@dataclass
class LoginInput:
    username: str
    password: str

@dataclass
class LoginOutput:
    access_token: str
    token_type: str = "bearer"
    user_id: str = ""
    name: str = ""
    global_roles: List[str] = None

class LoginUseCase:
    def __init__(self, session: Session, auth_service: AuthService):
        self.session = session
        self.auth_service = auth_service

    def execute(self, input_data: LoginInput) -> Optional[LoginOutput]:
        # Find account by username
        account = self.session.query(AccountModel).filter_by(username=input_data.username).first()
        
        if not account:
            return None
            
        # Verify password
        if not self.auth_service.verify_password(input_data.password, account.password_hash):
            return None
            
        # Get user details
        user = account.user
        
        # Create token
        token_data = {
            "sub": user.uid,
            "email": user.email,
            "roles": user.global_roles
        }
        token = self.auth_service.create_access_token(token_data)
        
        return LoginOutput(
            access_token=token,
            user_id=user.uid,
            name=user.name,
            global_roles=user.global_roles
        )
