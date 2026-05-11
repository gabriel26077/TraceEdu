from typing import List
from app.domain.subject.repositories.subject_repository import SubjectRepository
from .register_subject_use_case import SubjectOutput

class ListSubjectsUseCase:
    def __init__(self, subject_repository: SubjectRepository):
        self.subject_repository = subject_repository

    def execute(self) -> List[SubjectOutput]:
        subjects = self.subject_repository.get_all()
        return [
            SubjectOutput(
                uid=s.uid,
                name=s.name,
                level=s.level.value,
                academic_units=s.academic_units,
                offering_type=s.offering_type.value,
                description=s.description
            ) for s in subjects
        ]
