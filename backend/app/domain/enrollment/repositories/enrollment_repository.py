from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.enrollment.entities.enrollment import Enrollment

class EnrollmentRepository(ABC):
    @abstractmethod
    def save(self, enrollment: Enrollment) -> None:
        pass
    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[Enrollment]:
        pass
    @abstractmethod
    def get_by_student_and_offering(self, student_id: str, offering_id: str) -> Optional[Enrollment]:
        pass
    @abstractmethod
    def list_by_offering(self, offering_id: str) -> List[Enrollment]:
        pass
