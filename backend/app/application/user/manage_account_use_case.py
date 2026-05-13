import uuid
from app.domain.user.repositories.user_repository import UserRepository
from app.infrastructure.database.models import AccountModel
from app.infrastructure.security.auth_service import AuthService
from sqlalchemy.orm import Session

class ManageAccountUseCase:
    def __init__(self, db: Session, auth_service: AuthService):
        self.db = db
        self.auth_service = auth_service

    def create_or_update_account(self, user_id: str, username: str, password: str):
        # Check if account already exists
        account = self.db.query(AccountModel).filter_by(user_id=user_id).first()
        
        password_hash = self.auth_service.get_password_hash(password)
        
        if account:
            account.username = username
            account.password_hash = password_hash
        else:
            account = AccountModel(
                uid=str(uuid.uuid4()),
                user_id=user_id,
                username=username,
                password_hash=password_hash
            )
            self.db.add(account)
        
        self.db.commit()
        return account
