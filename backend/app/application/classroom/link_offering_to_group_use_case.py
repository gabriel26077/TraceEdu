from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository

class LinkOfferingToGroupUseCase:
    def __init__(self, offering_repo: SubjectOfferingRepository, group_repo: ClassGroupRepository):
        self.offering_repo = offering_repo
        self.group_repo = group_repo

    def execute(self, offering_id: str, group_id: str) -> None:
        offering = self.offering_repo.get_by_id(offering_id)
        if not offering:
            raise Exception("Subject offering not found")
            
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise Exception("Class group not found")

        # Update Offering
        offering.class_group_id = group_id
        self.offering_repo.save(offering)

        # Update Group
        if offering_id not in group.offering_ids:
            group.offering_ids.append(offering_id)
            self.group_repo.save(group)
