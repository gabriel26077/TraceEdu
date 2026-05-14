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
        model.period = group.period
        model.is_regular = group.is_regular
        model.level = group.level
        model.grade = group.grade
        model.notes = group.notes
        model.student_ids = group.student_ids
        model.offering_ids = group.offering_ids
        model.required_subject_ids = group.required_subject_ids
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[ClassGroup]:
        model = self.session.query(ClassGroupModel).filter_by(uid=uid).first()
        if not model: return None
        return self._to_entity(model)

    def list_by_school(self, school_id: str) -> List[ClassGroup]:
        models = self.session.query(ClassGroupModel).filter_by(school_id=school_id).all()
        return [self._to_entity(m) for m in models]

    def delete(self, uid: str) -> None:
        model = self.session.query(ClassGroupModel).filter_by(uid=uid).first()
        if model:
            self.session.delete(model)
            self.session.flush()

    def _to_entity(self, model: ClassGroupModel) -> ClassGroup:
        return ClassGroup(
            uid=model.uid,
            school_id=model.school_id,
            name=model.name,
            shift=model.shift,
            period=model.period,
            is_regular=model.is_regular,
            level=model.level,
            grade=model.grade,
            notes=model.notes,
            student_ids=model.student_ids,
            offering_ids=model.offering_ids,
            required_subject_ids=model.required_subject_ids
        )
