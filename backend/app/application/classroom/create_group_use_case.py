from dataclasses import dataclass, field
from typing import List, Optional
from uuid import uuid4
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository

@dataclass
class CreateGroupInput:
    school_id: str
    name: str
    shift: str
    period: str
    is_regular: bool = False
    level: Optional[str] = None
    grade: Optional[str] = None
    notes: Optional[str] = None
    offering_ids: List[str] = field(default_factory=list)
    required_subject_ids: List[str] = field(default_factory=list)

class CreateGroupUseCase:
    def __init__(self, repo: ClassGroupRepository): self.repo = repo
    def execute(self, input: CreateGroupInput):
        group = ClassGroup(
            uid=str(uuid4()), 
            school_id=input.school_id, 
            name=input.name, 
            shift=input.shift,
            period=input.period,
            is_regular=input.is_regular,
            level=input.level,
            grade=input.grade,
            notes=input.notes,
            offering_ids=input.offering_ids,
            required_subject_ids=input.required_subject_ids
        )
        self.repo.save(group)
        return group
