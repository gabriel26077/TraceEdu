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
            
        # Cleanup: Find and remove from Class Group(s)
        # Since an offering doesn't know its group anymore, we search groups in the school
        groups = self.group_repo.list_by_school(offering.school_id)
        for group in groups:
            if uid in group.offering_ids:
                group.offering_ids.remove(uid)
                self.group_repo.save(group)

        self.repo.delete(uid)
