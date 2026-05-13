from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.school.entities.school import School, Representative
from app.domain.school.repositories.school_repository import SchoolRepository
from app.infrastructure.database.models import SchoolModel

class SQLAlchemySchoolRepository(SchoolRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, school: School) -> None:
        model = self.session.query(SchoolModel).filter_by(uid=school.uid).first()
        if not model:
            model = SchoolModel(uid=school.uid)
        
        model.name = school.name
        model.coordination_email = school.coordination_email
        model.coordination_phone = school.coordination_phone
        model.settings = school.settings
        model.representatives = [
            {"user_id": r.user_id, "description": r.description, "contact": r.contact}
            for r in school.representatives
        ]
        model.status = school.status
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[School]:
        model = self.session.query(SchoolModel).filter_by(uid=uid).first()
        if not model:
            return None
        
        return School(
            uid=model.uid,
            name=model.name,
            coordination_email=model.coordination_email,
            coordination_phone=model.coordination_phone,
            settings=model.settings,
            representatives=[
                Representative(
                    user_id=r["user_id"], 
                    description=r["description"], 
                    contact=r["contact"]
                )
                for r in model.representatives
            ],
            status=model.status
        )

    def list_all(self) -> List[School]:
        models = self.session.query(SchoolModel).all()
        return [self.get_by_id(m.uid) for m in models] # Reuse conversion logic
