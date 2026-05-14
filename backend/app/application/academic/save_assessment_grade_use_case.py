from dataclasses import dataclass
from uuid import uuid4
from typing import Optional
from app.domain.academic.entities.grade import Grade
from app.domain.academic.repositories.grade_repository import GradeRepository

@dataclass
class SaveAssessmentGradeInput:
    offering_id: str
    student_id: str
    unit: int
    assessment_number: int
    value: float
    observations: Optional[str] = None

class SaveAssessmentGradeUseCase:
    def __init__(self, repository: GradeRepository):
        self.repository = repository

    def execute(self, input: SaveAssessmentGradeInput) -> Grade:
        # Check if grade already exists to update it, or create a new one
        existing = self.repository.get_specific_grade(
            input.offering_id, 
            input.student_id, 
            input.unit, 
            input.assessment_number
        )
        
        if existing:
            grade = existing
            grade.value = input.value
            grade.observations = input.observations
        else:
            grade = Grade(
                uid=str(uuid4()),
                offering_id=input.offering_id,
                student_id=input.student_id,
                unit=input.unit,
                assessment_number=input.assessment_number,
                value=input.value,
                observations=input.observations
            )
            
        self.repository.save(grade)
        return grade
