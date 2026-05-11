from dataclasses import dataclass, field
from typing import List
from app.domain.classroom.value_objects import Shift
from app.domain.exceptions import DomainException

@dataclass
class ClassGroup:
    uid: str
    name: str
    shift: Shift
    student_ids: List[str] = field(default_factory=list)
    base_subject_offering_ids: List[str] = field(default_factory=list)

    def __post_init__(self):
        if not self.name or not self.name.strip():
            raise DomainException("ClassGroup name cannot be empty")

    def add_student(self, student_id: str):
        if student_id not in self.student_ids:
            self.student_ids.append(student_id)

    def remove_student(self, student_id: str):
        if student_id in self.student_ids:
            self.student_ids.remove(student_id)

    def add_base_subject(self, offering_id: str):
        if offering_id not in self.base_subject_offering_ids:
            self.base_subject_offering_ids.append(offering_id)
