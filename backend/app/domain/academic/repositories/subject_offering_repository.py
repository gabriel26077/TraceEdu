from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.academic.entities.subject_offering import SubjectOffering

class SubjectOfferingRepository(ABC):
    @abstractmethod
    def save(self, offering: SubjectOffering) -> None:
        pass
    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[SubjectOffering]:
        pass
    @abstractmethod
    def list_by_school(self, school_id: str) -> List[SubjectOffering]:
        pass
