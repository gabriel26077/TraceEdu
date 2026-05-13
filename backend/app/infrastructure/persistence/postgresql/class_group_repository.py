from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.infrastructure.database.models import ClassGroupModel

class SQLAlchemyClassGroupRepository(ClassGroupRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, group: ClassGroup) -> None:
        model = self.session.query(ClassGroupModel).filter_by(uid=group.uid).first()
        if not model:
            model = ClassGroupModel(uid=group.uid)
        
        model.school_id = group.school_id
        model.name = group.name
        model.shift = group.shift
        model.student_ids = group.student_ids
        model.base_subject_ids = group.base_subject_offering_ids
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[ClassGroup]:
        model = self.session.query(ClassGroupModel).filter_by(uid=uid).first()
        if not model: return None
        return self._to_entity(model)

    def list_by_school(self, school_id: str) -> List[ClassGroup]:
        models = self.session.query(ClassGroupModel).filter_by(school_id=school_id).all()
        return [self._to_entity(m) for m in models]

    def _to_entity(self, model: ClassGroupModel) -> ClassGroup:
        return ClassGroup(
            uid=model.uid,
            school_id=model.school_id,
            name=model.name,
            shift=model.shift,
            student_ids=model.student_ids,
            base_subject_offering_ids=model.base_subject_ids
        )
