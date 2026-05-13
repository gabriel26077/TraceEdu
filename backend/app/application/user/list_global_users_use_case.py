from typing import List, Dict
from app.infrastructure.database.models import UserModel, SchoolMemberModel, SchoolModel
from sqlalchemy.orm import Session

class ListGlobalUsersUseCase:
    def __init__(self, db: Session):
        self.db = db

    def execute(self) -> List[Dict]:
        # Fetch all users
        users = self.db.query(UserModel).all()
        
        # For each user, fetch their schools for context
        result = []
        for user in users:
            memberships = self.db.query(SchoolMemberModel, SchoolModel.name).join(
                SchoolModel, SchoolMemberModel.school_id == SchoolModel.uid
            ).filter(SchoolMemberModel.user_id == user.uid).all()
            
            schools = [{"id": m[0].school_id, "name": m[1], "roles": m[0].roles} for m in memberships]
            
            result.append({
                "uid": user.uid,
                "name": user.name,
                "email": user.email,
                "cpf": user.cpf,
                "global_roles": user.global_roles or [],
                "status": user.status,
                "schools": schools
            })
            
        return result
