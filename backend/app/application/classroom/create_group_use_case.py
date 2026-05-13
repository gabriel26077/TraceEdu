from dataclasses import dataclass, field
from typing import List
from uuid import uuid4
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository

@dataclass
class CreateGroupInput:
    school_id: str
    name: str
    shift: str
    base_offering_ids: List[str] = field(default_factory=list)

class CreateGroupUseCase:
    def __init__(self, repo: ClassGroupRepository): self.repo = repo
    def execute(self, input: CreateGroupInput):
        group = ClassGroup(uid=str(uuid4()), school_id=input.school_id, name=input.name, 
                           shift=input.shift, base_subject_offering_ids=input.base_offering_ids)
        self.repo.save(group)
        return group
