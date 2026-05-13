from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository

class DeleteOfferingUseCase:
    def __init__(self, repo: SubjectOfferingRepository):
        self.repo = repo

    def execute(self, uid: str) -> None:
        offering = self.repo.get_by_id(uid)
        if not offering:
            raise Exception("Subject offering not found")
            
        self.repo.delete(uid)
