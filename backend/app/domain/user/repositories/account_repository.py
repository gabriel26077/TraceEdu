from abc import ABC, abstractmethod
from typing import Optional
from app.domain.user.entities.account import Account

class AccountRepository(ABC):
    @abstractmethod
    def save(self, account: Account) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[Account]:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[Account]:
        pass

    @abstractmethod
    def delete(self, uid: str) -> None:
        pass
