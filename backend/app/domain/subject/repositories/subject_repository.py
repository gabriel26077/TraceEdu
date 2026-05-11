from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.subject.entities.subject import Subject

class SubjectRepository(ABC):
    @abstractmethod
    def save(self, subject: Subject) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[Subject]:
        pass

    @abstractmethod
    def get_all(self) -> List[Subject]:
        pass
