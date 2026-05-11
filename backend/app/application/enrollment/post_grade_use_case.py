from dataclasses import dataclass
from uuid import uuid4
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.enrollment.entities.enrollment import Grade
from app.domain.enrollment.value_objects import AcademicGrade, GradeType
from app.domain.enrollment.policies import RecoveryPolicy
from app.domain.exceptions import DomainException

@dataclass
class PostGradeInput:
    enrollment_id: str
    term: int
    value: float
    grade_type: str = "regular"

class PostGradeUseCase:
    def __init__(self, enrollment_repository: EnrollmentRepository, recovery_policy: RecoveryPolicy):
        self.enrollment_repository = enrollment_repository
        self.recovery_policy = recovery_policy

    def execute(self, input: PostGradeInput) -> None:
        # 1. Fetch enrollment
        enrollment = self.enrollment_repository.get_by_id(input.enrollment_id)
        if not enrollment:
            raise DomainException(f"Enrollment not found: {input.enrollment_id}")

        # 2. Create the grade
        grade_type = GradeType(input.grade_type)
        grade = Grade(
            uid=str(uuid4()),
            term=input.term,
            value=AcademicGrade(input.value),
            grade_type=grade_type
        )

        # 3. Apply logic based on type
        if grade_type == GradeType.RECOVERY:
            self.recovery_policy.apply(enrollment, grade)
        else:
            enrollment.add_grade(grade)

        # 4. Save
        self.enrollment_repository.save(enrollment)
