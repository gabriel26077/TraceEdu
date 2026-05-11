from dataclasses import dataclass, field
from typing import List
from app.domain.subject.value_objects import AcademicPeriod
from app.domain.exceptions import DomainException

@dataclass
class SubjectOffering:
    uid: str
    subject_id: str
    teacher_ids: List[str]
    period: AcademicPeriod
    enrollment_ids: List[str] = field(default_factory=list)

    def __post_init__(self):
        if not self.teacher_ids:
            raise DomainException("At least one teacher is required for an offering")

    def add_teacher(self, teacher_id: str):
        if teacher_id not in self.teacher_ids:
            self.teacher_ids.append(teacher_id)

    def remove_teacher(self, teacher_id: str):
        if len(self.teacher_ids) <= 1:
            raise DomainException("At least one teacher is required for an offering")
        if teacher_id in self.teacher_ids:
            self.teacher_ids.remove(teacher_id)

    def add_enrollment(self, enrollment_id: str):
        if enrollment_id not in self.enrollment_ids:
            self.enrollment_ids.append(enrollment_id)
