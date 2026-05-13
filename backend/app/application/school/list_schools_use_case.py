from typing import List
from app.domain.school.entities.school import School
from app.domain.school.repositories.school_repository import SchoolRepository
from app.infrastructure.database.models import SchoolMemberModel, UserModel
from sqlalchemy.orm import Session

class ListSchoolsUseCase:
    def __init__(self, repository: SchoolRepository, db: Session):
        self.repository = repository
        self.db = db

    def execute(self, user: UserModel) -> List[School]:
        # 1. Check if user is platform_admin
        is_platform_admin = "platform_admin" in (user.global_roles or [])
        
        if is_platform_admin:
            # Platform admins see everything
            return self.repository.list_all()
        
        # 2. Regular users see only schools they belong to
        memberships = self.db.query(SchoolMemberModel).filter_by(user_id=user.uid).all()
        school_ids = [m.school_id for m in memberships]
        
        # Filter schools by these IDs
        all_schools = self.repository.list_all()
        return [s for s in all_schools if s.uid in school_ids]
