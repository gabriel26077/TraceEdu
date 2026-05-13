from dataclasses import dataclass
from typing import List, Dict
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.user.repositories.user_repository import UserRepository

@dataclass
class StudentReport:
    student_name: str
    enrollment_status: str
    grades: List[Dict]

@dataclass
class ClassReportResponse:
    group_name: str
    students: List[StudentReport]

class GetClassGradesReportUseCase:
    def __init__(self, class_repo: ClassGroupRepository, enroll_repo: EnrollmentRepository, user_repo: UserRepository):
        self.class_repo = class_repo
        self.enroll_repo = enroll_repo
        self.user_repo = user_repo

    def execute(self, group_id: str, offering_id: str) -> ClassReportResponse:
        group = self.class_repo.get_by_id(group_id)
        if not group: raise Exception("Group not found")
        
        report_students = []
        for student_id in group.student_ids:
            student = self.user_repo.get_by_id(student_id)
            enrollment = self.enroll_repo.get_by_student_and_offering(student_id, offering_id)
            
            if student:
                grades_list = []
                status = "Not Enrolled"
                if enrollment:
                    status = enrollment.status
                    grades_list = [{"term": g.term, "value": g.value, "type": g.grade_type} for g in enrollment.grades]
                
                report_students.append(StudentReport(
                    student_name=student.name,
                    enrollment_status=status,
                    grades=grades_list
                ))
                
        return ClassReportResponse(group_name=group.name, students=report_students)
