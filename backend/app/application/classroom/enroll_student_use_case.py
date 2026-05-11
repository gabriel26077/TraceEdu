from dataclasses import dataclass
from uuid import uuid4
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.classroom.repositories.classroom_repository import ClassGroupRepository
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.enrollment.entities.enrollment import Enrollment
from app.domain.exceptions import DomainException

@dataclass
class EnrollStudentInput:
    student_id: str
    class_group_id: str

class EnrollStudentUseCase:
    def __init__(
        self, 
        user_repository: UserRepository,
        class_group_repository: ClassGroupRepository,
        enrollment_repository: EnrollmentRepository
    ):
        self.user_repository = user_repository
        self.class_group_repository = class_group_repository
        self.enrollment_repository = enrollment_repository

    def execute(self, input: EnrollStudentInput) -> None:
        # 1. Fetch entities
        student = self.user_repository.get_by_id(input.student_id)
        if not student:
            raise DomainException(f"Student not found: {input.student_id}")
            
        class_group = self.class_group_repository.get_by_id(input.class_group_id)
        if not class_group:
            raise DomainException(f"Class group not found: {input.class_group_id}")

        # 2. Add student to the group
        class_group.add_student(student.uid)
        
        # 3. Automatic enrollments for each base subject
        for offering_id in class_group.base_subject_offering_ids:
            enrollment = Enrollment(
                uid=str(uuid4()),
                student_id=student.uid,
                subject_offering_id=offering_id
            )
            self.enrollment_repository.save(enrollment)
            
        # 4. Save the updated group
        self.class_group_repository.save(class_group)
