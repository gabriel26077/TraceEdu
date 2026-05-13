from dataclasses import dataclass
from app.domain.enrollment.entities.enrollment import Grade
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.enrollment.policies import SubstitutionRecoveryPolicy

@dataclass
class PostGradeInput:
    enrollment_id: str
    term: int
    value: float
    grade_type: str = "regular"

class PostGradeUseCase:
    def __init__(self, repo: EnrollmentRepository, policy: SubstitutionRecoveryPolicy):
        self.repo = repo
        self.policy = policy
    def execute(self, input: PostGradeInput):
        enrollment = self.repo.get_by_id(input.enrollment_id)
        if not enrollment: raise Exception("Enrollment not found")
        
        from app.domain.enrollment.value_objects.grade_type import GradeType
        from app.domain.enrollment.value_objects.academic_grade import AcademicGrade
        
        new_grade = Grade(
            term=input.term, 
            value=AcademicGrade(input.value), 
            grade_type=GradeType(input.grade_type)
        )
        
        if new_grade.grade_type == GradeType.REGULAR:
            enrollment.add_grade(new_grade)
        else:
            self.policy.apply(enrollment, new_grade)
            
        self.repo.save(enrollment)
