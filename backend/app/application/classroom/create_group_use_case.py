from dataclasses import dataclass
from typing import List
from uuid import uuid4
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.value_objects import Shift
from app.domain.classroom.repositories.classroom_repository import ClassGroupRepository

@dataclass
class CreateGroupInput:
    name: str
    shift: str
    base_offering_ids: List[str]

@dataclass
class GroupOutput:
    uid: str
    name: str
    shift: str
    student_ids: List[str]
    base_offering_ids: List[str]

class CreateGroupUseCase:
    def __init__(self, group_repository: ClassGroupRepository):
        self.group_repository = group_repository

    def execute(self, input: CreateGroupInput) -> GroupOutput:
        group = ClassGroup(
            uid=str(uuid4()),
            name=input.name,
            shift=Shift(input.shift),
            base_subject_offering_ids=input.base_offering_ids
        )
        self.group_repository.save(group)
        return GroupOutput(
            uid=group.uid,
            name=group.name,
            shift=group.shift.value,
            student_ids=group.student_ids,
            base_offering_ids=group.base_subject_offering_ids
        )
