from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository

class DeleteGroupUseCase:
    def __init__(self, group_repo: ClassGroupRepository, offering_repo: SubjectOfferingRepository):
        self.group_repo = group_repo
        self.offering_repo = offering_repo

    def execute(self, uid: str) -> None:
        group = self.group_repo.get_by_id(uid)
        if not group:
            raise Exception("Class group not found")

        # 1. Delete the group itself
        # (Offerings are independent, so removing the group automatically breaks the link stored in offering_ids)
        self.group_repo.delete(uid)
