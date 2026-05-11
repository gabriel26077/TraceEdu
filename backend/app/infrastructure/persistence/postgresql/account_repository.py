from typing import Optional
from sqlalchemy.orm import Session
from app.domain.user.entities.account import Account
from app.domain.user.repositories.account_repository import AccountRepository
from app.infrastructure.database.models import AccountModel

class SQLAlchemyAccountRepository(AccountRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, account: Account) -> None:
        model = self.session.query(AccountModel).filter_by(uid=account.uid).first()
        
        if model:
            model.username = account.username
            model.password_hash = account.password_hash
            model.status = account.status
        else:
            model = AccountModel(
                uid=account.uid,
                user_id=account.user_id,
                username=account.username,
                password_hash=account.password_hash,
                status=account.status
            )
            self.session.add(model)
        
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[Account]:
        model = self.session.query(AccountModel).filter_by(uid=uid).first()
        if not model:
            return None
        return self._to_domain(model)

    def get_by_username(self, username: str) -> Optional[Account]:
        model = self.session.query(AccountModel).filter_by(username=username).first()
        if not model:
            return None
        return self._to_domain(model)

    def delete(self, uid: str) -> None:
        model = self.session.query(AccountModel).filter_by(uid=uid).first()
        if model:
            self.session.delete(model)
            self.session.commit()

    def _to_domain(self, model: AccountModel) -> Account:
        return Account(
            uid=model.uid,
            user_id=model.user_id,
            username=model.username,
            password_hash=model.password_hash,
            status=model.status
        )
