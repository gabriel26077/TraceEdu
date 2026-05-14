import uuid
from app.domain.subject.repositories.global_subject_repository import GlobalSubjectRepository
from app.domain.subject.entities.global_subject import GlobalSubject

class CreateGlobalSubjectUseCase:
    def __init__(self, repository: GlobalSubjectRepository):
        self.repository = repository

    def execute(self, name: str, level: str, grade: str, academic_units: int = 3, assessments_per_unit: int = 2, category: str = None, description: str = None) -> GlobalSubject:
        new_subject = GlobalSubject(
            uid=str(uuid.uuid4()),
            name=name,
            level=level,
            grade=grade,
            academic_units=academic_units,
            assessments_per_unit=assessments_per_unit,
            category=category,
            description=description
        )
        self.repository.save(new_subject)
        return new_subject
