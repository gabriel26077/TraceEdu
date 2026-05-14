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

        # 1. Unlink all subject offerings
        # We need to find all offerings that belong to this school and have this class_group_id
        # Actually, the most reliable way is to iterate over the group's own offering_ids
        for offering_id in group.offering_ids:
            offering = self.offering_repo.get_by_id(offering_id)
            if offering and offering.class_group_id == uid:
                offering.class_group_id = None
                self.offering_repo.save(offering)

        # 2. Delete the group itself
        self.group_repo.delete(uid)
