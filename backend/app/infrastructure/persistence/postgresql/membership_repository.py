from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.school.entities.membership import SchoolMember
from app.domain.school.repositories.membership_repository import SchoolMemberRepository
from app.infrastructure.database.models import SchoolMemberModel

class SQLAlchemySchoolMemberRepository(SchoolMemberRepository):
    def __init__(self, session: Session):
        self.session = session
    def save(self, membership: SchoolMember) -> None:
        model = self.session.query(SchoolMemberModel).filter_by(uid=membership.uid).first()
        if not model: model = SchoolMemberModel(uid=membership.uid)
        model.school_id = membership.school_id
        model.user_id = membership.user_id
        model.roles = membership.roles
        model.status = membership.status
        self.session.add(model)
        self.session.flush()
    def list_by_user(self, user_id: str):
        models = self.session.query(SchoolMemberModel).filter_by(user_id=user_id).all()
        return [self._to_entity(m) for m in models]
    def list_by_school(self, school_id: str):
        models = self.session.query(SchoolMemberModel).filter_by(school_id=school_id).all()
        return [self._to_entity(m) for m in models]
    def get_by_school_and_user(self, school_id: str, user_id: str):
        model = self.session.query(SchoolMemberModel).filter_by(school_id=school_id, user_id=user_id).first()
        return self._to_entity(model) if model else None
    def _to_entity(self, model: SchoolMemberModel):
        return SchoolMember(uid=model.uid, school_id=model.school_id, user_id=model.user_id,
                           roles=model.roles, status=model.status)
