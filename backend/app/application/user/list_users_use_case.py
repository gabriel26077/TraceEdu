from app.domain.user.repositories.user_repository import UserRepository
class ListUsersUseCase:
    def __init__(self, repo: UserRepository): self.repo = repo
    def execute(self, school_id: str): return self.repo.list_by_school(school_id)
