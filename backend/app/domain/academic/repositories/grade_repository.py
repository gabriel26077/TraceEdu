from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.academic.entities.grade import Grade

class GradeRepository(ABC):
    @abstractmethod
    def save(self, grade: Grade) -> None:
        pass

    @abstractmethod
    def get_by_id(self, uid: str) -> Optional[Grade]:
        pass

    @abstractmethod
    def list_by_offering(self, offering_id: str) -> List[Grade]:
        pass

    @abstractmethod
    def list_by_student(self, student_id: str) -> List[Grade]:
        pass

    @abstractmethod
    def get_specific_grade(self, offering_id: str, student_id: str, unit: int, assessment_number: int) -> Optional[Grade]:
        """Finds a unique grade for a student in a specific assessment of a unit."""
        pass
