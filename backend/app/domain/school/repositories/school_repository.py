from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.school.entities.school import School

class SchoolRepository(ABC):
    @abstractmethod
    def save(self, school: School) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[School]:
        pass

    @abstractmethod
    def list_all(self) -> List[School]:
        pass
