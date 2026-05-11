from dataclasses import dataclass, field
from typing import List
from uuid import uuid4
from app.domain.classroom.entities.subject_offering import SubjectOffering
from app.domain.subject.value_objects import AcademicPeriod
from app.domain.classroom.repositories.classroom_repository import SubjectOfferingRepository
from app.domain.exceptions import DomainException

@dataclass
class CreateOfferingInput:
    subject_id: str
    period: str
    teacher_ids: List[str]

@dataclass
class OfferingOutput:
    uid: str
    subject_id: str
    period: str
    teacher_ids: List[str]

class CreateOfferingUseCase:
    def __init__(self, offering_repository: SubjectOfferingRepository):
        self.offering_repository = offering_repository

    def execute(self, input: CreateOfferingInput) -> OfferingOutput:
        offering = SubjectOffering(
            uid=str(uuid4()),
            subject_id=input.subject_id,
            period=AcademicPeriod(input.period),
            teacher_ids=input.teacher_ids
        )
        self.offering_repository.save(offering)
        return OfferingOutput(
            uid=offering.uid,
            subject_id=offering.subject_id,
            period=offering.period.value,
            teacher_ids=offering.teacher_ids
        )
