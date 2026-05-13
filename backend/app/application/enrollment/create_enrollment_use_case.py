from dataclasses import dataclass
from uuid import uuid4
from app.domain.enrollment.entities.enrollment import Enrollment
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository

@dataclass
class CreateEnrollmentInput:
    school_id: str
    student_id: str
    subject_offering_id: str

class CreateEnrollmentUseCase:
    def __init__(self, repo: EnrollmentRepository): self.repo = repo
    def execute(self, input: CreateEnrollmentInput):
        enrollment = Enrollment(uid=str(uuid4()), school_id=input.school_id, student_id=input.student_id, 
                                subject_offering_id=input.subject_offering_id)
        self.repo.save(enrollment)
        return enrollment
