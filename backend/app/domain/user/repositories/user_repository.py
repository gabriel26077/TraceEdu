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
    def get_by_cpf(self, cpf: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def list_by_school(self, school_id: str) -> List[User]:
        pass
