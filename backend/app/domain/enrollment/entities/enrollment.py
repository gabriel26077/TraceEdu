from dataclasses import dataclass, field
from typing import List, Optional
from app.domain.enrollment.value_objects import AcademicGrade, EnrollmentStatus, GradeType
from app.domain.exceptions import DomainException

@dataclass
class Grade:
    uid: str
    term: int
    value: AcademicGrade
    grade_type: GradeType = GradeType.REGULAR

@dataclass
class Enrollment:
    uid: str
    student_id: str
    subject_offering_id: str
    total_absences: int = 0
    status: EnrollmentStatus = EnrollmentStatus.ENROLLED
    grades: List[Grade] = field(default_factory=list)

    def add_grade(self, grade: Grade):
        # Poderíamos adicionar lógica aqui para não permitir notas duplicadas no mesmo termo/tipo
        self.grades.append(grade)

    def add_absences(self, count: int):
        if count < 0:
            raise DomainException("Absences count cannot be negative")
        self.total_absences += count

    def change_status(self, new_status: EnrollmentStatus):
        self.status = new_status
