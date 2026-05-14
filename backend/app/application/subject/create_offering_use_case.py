from dataclasses import dataclass, field
from typing import List, Optional
from uuid import uuid4
from app.domain.academic.entities.subject_offering import SubjectOffering
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository

@dataclass
class CreateOfferingInput:
    school_id: str
    subject_id: str
    period: str
    class_group_id: Optional[str] = None
    teacher_ids: List[str] = field(default_factory=list)

class CreateOfferingUseCase:
    def __init__(self, repo: SubjectOfferingRepository, group_repo: ClassGroupRepository): 
        self.repo = repo
        self.group_repo = group_repo

    def execute(self, input: CreateOfferingInput):
        offering = SubjectOffering(
            uid=str(uuid4()), 
            school_id=input.school_id, 
            subject_id=input.subject_id, 
            class_group_id=input.class_group_id,
            period=input.period, 
            teacher_ids=input.teacher_ids
        )
        self.repo.save(offering)

        # Update ClassGroup if provided
        if input.class_group_id:
            group = self.group_repo.get_by_id(input.class_group_id)
            if group:
                if offering.uid not in group.offering_ids:
                    group.offering_ids.append(offering.uid)
                    self.group_repo.save(group)

        return offering
