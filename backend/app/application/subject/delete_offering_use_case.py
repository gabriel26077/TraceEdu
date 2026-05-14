from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository

class DeleteOfferingUseCase:
    def __init__(self, repo: SubjectOfferingRepository, group_repo: ClassGroupRepository):
        self.repo = repo
        self.group_repo = group_repo

    def execute(self, uid: str) -> None:
        offering = self.repo.get_by_id(uid)
        if not offering:
            raise Exception("Subject offering not found")
            
        # Cleanup: Remove from Class Group if linked
        if offering.class_group_id:
            group = self.group_repo.get_by_id(offering.class_group_id)
            if group and uid in group.offering_ids:
                group.offering_ids.remove(uid)
                self.group_repo.save(group)

        self.repo.delete(uid)
