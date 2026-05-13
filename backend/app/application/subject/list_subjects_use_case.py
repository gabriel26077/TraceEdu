from app.domain.subject.repositories.subject_repository import SubjectRepository
class ListSubjectsUseCase:
    def __init__(self, repo: SubjectRepository): self.repo = repo
    def execute(self, school_id: str): return self.repo.list_by_school(school_id)
