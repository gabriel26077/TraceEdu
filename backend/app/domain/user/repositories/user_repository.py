from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.user.entities.user import User

class UserRepository(ABC):
    @abstractmethod
    def save(self, user: User) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_all(self) -> List[User]:
        pass

    @abstractmethod
    def delete(self, uid: str) -> None:
        pass
