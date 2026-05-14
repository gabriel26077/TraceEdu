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
    grade: str
    academic_units: int
    assessments_per_unit: int
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
            grade=input.grade,
            academic_units=input.academic_units,
            assessments_per_unit=input.assessments_per_unit,
            offering_type=input.offering_type,
            description=input.description
        )
        self.repository.save(subject)
        return subject

class UpdateSubjectUseCase:
    def __init__(self, repository: SubjectRepository):
        self.repository = repository

    def execute(self, uid: str, name: str, level: str, grade: str, academic_units: int, assessments_per_unit: int, description: str = None) -> Subject:
        subject = self.repository.get_by_id(uid)
        if not subject:
            raise Exception("Subject not found")
        
        subject.name = name
        subject.level = level
        subject.grade = grade
        subject.academic_units = academic_units
        subject.assessments_per_unit = assessments_per_unit
        subject.description = description
        
        self.repository.save(subject)
        return subject

class DeleteSubjectUseCase:
    def __init__(self, repository: SubjectRepository):
        self.repository = repository

    def execute(self, uid: str):
        self.repository.delete(uid)
