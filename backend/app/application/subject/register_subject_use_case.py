from dataclasses import dataclass
from uuid import uuid4
from typing import Optional
from app.domain.subject.entities.subject import Subject
from app.domain.subject.repositories.subject_repository import SubjectRepository

@dataclass
class RegisterSubjectInput:
    school_id: str
    name: str
    level: str
    academic_units: int
    offering_type: str
    description: Optional[str] = None

class RegisterSubjectUseCase:
    def __init__(self, repository: SubjectRepository):
        self.repository = repository

    def execute(self, input: RegisterSubjectInput) -> Subject:
        subject = Subject(
            uid=str(uuid4()),
            school_id=input.school_id,
            name=input.name,
            level=input.level,
            academic_units=input.academic_units,
            offering_type=input.offering_type,
            description=input.description
        )
        self.repository.save(subject)
        return subject
