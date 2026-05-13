from dataclasses import dataclass, field
from typing import List
from app.domain.enrollment.value_objects.academic_grade import AcademicGrade
from app.domain.enrollment.value_objects.grade_type import GradeType
from app.domain.enrollment.value_objects.enrollment_status import EnrollmentStatus

@dataclass
class Grade:
    term: int
    value: AcademicGrade
    grade_type: GradeType = GradeType.REGULAR
    uid: str = field(default_factory=lambda: "") # Optional ID for persistence logic

@dataclass
class Enrollment:
    uid: str
    school_id: str
    student_id: str
    subject_offering_id: str
    status: EnrollmentStatus = EnrollmentStatus.ENROLLED
    total_absences: int = 0
    grades: List[Grade] = field(default_factory=list)

    def add_grade(self, grade: Grade):
        self.grades.append(grade)
