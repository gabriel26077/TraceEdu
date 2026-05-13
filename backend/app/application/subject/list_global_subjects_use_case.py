from typing import List
from app.domain.subject.repositories.global_subject_repository import GlobalSubjectRepository
from app.domain.subject.entities.global_subject import GlobalSubject

class ListGlobalSubjectsUseCase:
    def __init__(self, repository: GlobalSubjectRepository):
        self.repository = repository

    def execute(self) -> List[GlobalSubject]:
        return self.repository.list_all()
