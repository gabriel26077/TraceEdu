from typing import List
from app.domain.school.entities.school import School
from app.domain.school.repositories.school_repository import SchoolRepository
from app.infrastructure.database.models import SchoolMemberModel, UserModel
from sqlalchemy.orm import Session

class ListSchoolsUseCase:
    def __init__(self, repository: SchoolRepository, db: Session):
        self.repository = repository
        self.db = db

    def execute(self, user: UserModel) -> List[dict]:
        # 1. Check if user is platform_admin
        is_platform_admin = "platform_admin" in (user.global_roles or [])
        
        if is_platform_admin:
            # Platform admins see everything as admin
            schools = self.repository.list_all()
            return [{"school": s, "role": "admin"} for s in schools]
        
        # 2. Regular users see only schools they belong to
        memberships = self.db.query(SchoolMemberModel).filter_by(user_id=user.uid).all()
        # Map school_id to the primary role (first role in list)
        role_map = {m.school_id: m.roles[0] if (m.roles and len(m.roles) > 0) else "user" for m in memberships}
        
        all_schools = self.repository.list_all()
        result = []
        for s in all_schools:
            if s.uid in role_map:
                result.append({
                    "school": s,
                    "role": role_map[s.uid]
                })
        
        return result
