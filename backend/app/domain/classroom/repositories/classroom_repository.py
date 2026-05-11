from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.entities.subject_offering import SubjectOffering

class ClassGroupRepository(ABC):
    @abstractmethod
    def save(self, group: ClassGroup) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[ClassGroup]:
        pass

class SubjectOfferingRepository(ABC):
    @abstractmethod
    def save(self, offering: SubjectOffering) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[SubjectOffering]:
        pass

    @abstractmethod
    def get_by_period(self, period: str) -> List[SubjectOffering]:
        pass
