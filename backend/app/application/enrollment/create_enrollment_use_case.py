from dataclasses import dataclass
from uuid import uuid4
from app.domain.enrollment.entities.enrollment import Enrollment
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository

@dataclass
class CreateEnrollmentInput:
    student_id: str
    subject_offering_id: str

@dataclass
class EnrollmentOutput:
    uid: str
    student_id: str
    subject_offering_id: str
    status: str

class CreateEnrollmentUseCase:
    def __init__(self, enrollment_repository: EnrollmentRepository):
        self.enrollment_repository = enrollment_repository

    def execute(self, input: CreateEnrollmentInput) -> EnrollmentOutput:
        enrollment = Enrollment(
            uid=str(uuid4()),
            student_id=input.student_id,
            subject_offering_id=input.subject_offering_id
        )
        self.enrollment_repository.save(enrollment)
        return EnrollmentOutput(
            uid=enrollment.uid,
            student_id=enrollment.student_id,
            subject_offering_id=enrollment.subject_offering_id,
            status=enrollment.status.value
        )
