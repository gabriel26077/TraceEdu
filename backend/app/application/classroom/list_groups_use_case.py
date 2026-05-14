from typing import List
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.domain.classroom.entities.class_group import ClassGroup

class ListGroupsUseCase:
    def __init__(self, repo: ClassGroupRepository):
        self.repo = repo

    def execute(self, school_id: str) -> List[ClassGroup]:
        return self.repo.list_by_school(school_id)
