from dataclasses import dataclass
from typing import Optional
from uuid import uuid4
from app.domain.subject.entities.subject import Subject
from app.domain.subject.value_objects import SubjectLevel, OfferingType
from app.domain.subject.repositories.subject_repository import SubjectRepository

@dataclass
class RegisterSubjectInput:
    name: str
    level: str
    academic_units: int
    offering_type: str
    description: Optional[str] = None

@dataclass
class SubjectOutput:
    uid: str
    name: str
    level: str
    academic_units: int
    offering_type: str
    description: Optional[str] = None

class RegisterSubjectUseCase:
    def __init__(self, subject_repository: SubjectRepository):
        self.subject_repository = subject_repository

    def execute(self, input: RegisterSubjectInput) -> SubjectOutput:
        subject = Subject(
            uid=str(uuid4()),
            name=input.name,
            level=SubjectLevel(input.level),
            academic_units=input.academic_units,
            offering_type=OfferingType(input.offering_type),
            description=input.description
        )
        self.subject_repository.save(subject)
        return SubjectOutput(
            uid=subject.uid,
            name=subject.name,
            level=subject.level.value,
            academic_units=subject.academic_units,
            offering_type=subject.offering_type.value,
            description=subject.description
        )
