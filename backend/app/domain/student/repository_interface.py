from abc import ABC, abstractmethod
from typing import List
from .entity import Student

class IStudentRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Student]:
        pass

    @abstractmethod
    def get_by_id(self, student_id: int) -> Student:
        pass

    @abstractmethod
    def save(self, student: Student) -> Student:
        pass
