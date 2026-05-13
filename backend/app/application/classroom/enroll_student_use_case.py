from dataclasses import dataclass
from uuid import uuid4
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.enrollment.entities.enrollment import Enrollment

@dataclass
class EnrollStudentInput:
    student_id: str
    class_group_id: str

class EnrollStudentUseCase:
    def __init__(self, user_repo: UserRepository, class_repo: ClassGroupRepository, enroll_repo: EnrollmentRepository):
        self.user_repo = user_repo
        self.class_repo = class_repo
        self.enroll_repo = enroll_repo
    def execute(self, input: EnrollStudentInput):
        group = self.class_repo.get_by_id(input.class_group_id)
        if not group: raise Exception("Class Group not found")
        if input.student_id not in group.student_ids:
            group.student_ids.append(input.student_id)
            self.class_repo.save(group)
        for offering_id in group.base_subject_offering_ids:
            existing = self.enroll_repo.get_by_student_and_offering(input.student_id, offering_id)
            if not existing:
                enrollment = Enrollment(uid=str(uuid4()), school_id=group.school_id, student_id=input.student_id, 
                                        subject_offering_id=offering_id)
                self.enroll_repo.save(enrollment)
