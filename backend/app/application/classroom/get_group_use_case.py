from typing import Optional
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.domain.classroom.entities.class_group import ClassGroup

class GetGroupUseCase:
    def __init__(self, repo: ClassGroupRepository):
        self.repo = repo

    def execute(self, uid: str) -> Optional[ClassGroup]:
        return self.repo.get_by_id(uid)
