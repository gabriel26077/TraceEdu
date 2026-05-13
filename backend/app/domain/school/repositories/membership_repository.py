from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.school.entities.membership import SchoolMember

class SchoolMemberRepository(ABC):
    @abstractmethod
    def save(self, membership: SchoolMember) -> None:
        pass
    @abstractmethod
    def list_by_user(self, user_id: str) -> List[SchoolMember]:
        pass
    @abstractmethod
    def list_by_school(self, school_id: str) -> List[SchoolMember]:
        pass
    @abstractmethod
    def get_by_school_and_user(self, school_id: str, user_id: str) -> Optional[SchoolMember]:
        pass
