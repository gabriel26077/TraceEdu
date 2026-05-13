from typing import List
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.domain.academic.entities.subject_offering import SubjectOffering

class ListOfferingsUseCase:
    def __init__(self, repo: SubjectOfferingRepository):
        self.repo = repo

    def execute(self, school_id: str) -> List[SubjectOffering]:
        return self.repo.list_by_school(school_id)
