from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.classroom.entities.class_group import ClassGroup

class ClassGroupRepository(ABC):
    @abstractmethod
    def save(self, group: ClassGroup) -> None:
        pass
    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[ClassGroup]:
        pass
    @abstractmethod
    def list_by_school(self, school_id: str) -> List[ClassGroup]:
        pass
    @abstractmethod
    def delete(self, uid: str) -> None:
        pass
