from dataclasses import dataclass, field
from typing import List
from uuid import uuid4
from app.domain.academic.entities.subject_offering import SubjectOffering
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository

@dataclass
class CreateOfferingInput:
    school_id: str
    subject_id: str
    period: str
    teacher_ids: List[str] = field(default_factory=list)

class CreateOfferingUseCase:
    def __init__(self, repo: SubjectOfferingRepository): self.repo = repo
    def execute(self, input: CreateOfferingInput):
        offering = SubjectOffering(uid=str(uuid4()), school_id=input.school_id, subject_id=input.subject_id, 
                                   period=input.period, teacher_ids=input.teacher_ids)
        self.repo.save(offering)
        return offering
