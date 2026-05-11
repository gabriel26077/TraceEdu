from dataclasses import dataclass
from typing import List, Optional
from app.domain.classroom.repositories.classroom_repository import ClassGroupRepository
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.exceptions import DomainException

@dataclass
class StudentGradeOutput:
    student_id: str
    student_name: str
    is_enrolled: bool
    grades: List[dict] # Simplified list of grades

@dataclass
class ClassReportOutput:
    class_group_name: str
    subject_offering_id: str
    students: List[StudentGradeOutput]

class GetClassGradesReportUseCase:
    def __init__(
        self, 
        class_repo: ClassGroupRepository,
        enroll_repo: EnrollmentRepository,
        user_repo: UserRepository
    ):
        self.class_repo = class_repo
        self.enroll_repo = enroll_repo
        self.user_repo = user_repo

    def execute(self, class_group_id: str, offering_id: str) -> ClassReportOutput:
        # 1. Get Class Group
        group = self.class_repo.get_by_id(class_group_id)
        if not group:
            raise DomainException(f"Class Group not found: {class_group_id}")

        report_students = []

        # 2. For each student in group, find enrollment in this specific offering
        for student_id in group.student_ids:
            student_user = self.user_repo.get_by_id(student_id)
            student_name = student_user.name if student_user else "Unknown Student"
            
            enrollment = self.enroll_repo.get_by_student_and_offering(student_id, offering_id)
            
            if enrollment:
                student_grades = [
                    {"term": g.term, "value": g.value.value, "type": g.grade_type.value}
                    for g in enrollment.grades
                ]
                report_students.append(StudentGradeOutput(
                    student_id=student_id,
                    student_name=student_name,
                    is_enrolled=True,
                    grades=student_grades
                ))
            else:
                # Student is in class group but not enrolled in this specific offering
                report_students.append(StudentGradeOutput(
                    student_id=student_id,
                    student_name=student_name,
                    is_enrolled=False,
                    grades=[]
                ))

        return ClassReportOutput(
            class_group_name=group.name,
            subject_offering_id=offering_id,
            students=report_students
        )
