from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.subject.entities.global_subject import GlobalSubject

class GlobalSubjectRepository(ABC):
    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[GlobalSubject]:
        pass

    @abstractmethod
    def list_all(self) -> List[GlobalSubject]:
        pass

    @abstractmethod
    def save(self, subject: GlobalSubject) -> None:
        pass

    @abstractmethod
    def delete(self, uid: str) -> None:
        pass
