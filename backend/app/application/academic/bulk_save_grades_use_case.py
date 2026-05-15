from typing import List
from app.domain.academic.repositories.grade_repository import GradeRepository
from app.application.academic.save_assessment_grade_use_case import SaveAssessmentGradeUseCase, SaveAssessmentGradeInput

class BulkSaveGradesUseCase:
    def __init__(self, repository: GradeRepository):
        self.repository = repository
        self.single_save_use_case = SaveAssessmentGradeUseCase(repository)

    def execute(self, offering_id: str, grades_data: List[dict]) -> None:
        for data in grades_data:
            use_case_input = SaveAssessmentGradeInput(
                offering_id=offering_id,
                student_id=data["student_id"],
                unit=data["unit"],
                assessment_number=data["assessment_number"],
                value=data["value"],
                observations=data.get("observations")
            )
            self.single_save_use_case.execute(use_case_input)
