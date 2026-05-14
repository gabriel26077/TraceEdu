from typing import List
from app.domain.academic.entities.grade import Grade
from app.domain.academic.repositories.grade_repository import GradeRepository

class ListOfferingGradesUseCase:
    def __init__(self, repository: GradeRepository):
        self.repository = repository

    def execute(self, offering_id: str) -> List[Grade]:
        return self.repository.list_by_offering(offering_id)
