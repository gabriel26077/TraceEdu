from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.academic.entities.subject_offering import SubjectOffering
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.infrastructure.database.models import SubjectOfferingModel

class SQLAlchemySubjectOfferingRepository(SubjectOfferingRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, offering: SubjectOffering) -> None:
        model = self.session.query(SubjectOfferingModel).filter_by(uid=offering.uid).first()
        if not model:
            model = SubjectOfferingModel(uid=offering.uid)
        
        model.school_id = offering.school_id
        model.subject_id = offering.subject_id
        model.class_group_id = offering.class_group_id
        model.period = offering.period
        model.teacher_ids = offering.teacher_ids
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[SubjectOffering]:
        model = self.session.query(SubjectOfferingModel).filter_by(uid=uid).first()
        if not model: return None
        return self._to_entity(model)

    def list_by_school(self, school_id: str) -> List[SubjectOffering]:
        models = self.session.query(SubjectOfferingModel).filter_by(school_id=school_id).all()
        return [self._to_entity(m) for m in models]

    def delete(self, uid: str) -> None:
        self.session.query(SubjectOfferingModel).filter_by(uid=uid).delete()
        self.session.flush()

    def _to_entity(self, model: SubjectOfferingModel) -> SubjectOffering:
        return SubjectOffering(
            uid=model.uid,
            school_id=model.school_id,
            subject_id=model.subject_id,
            class_group_id=model.class_group_id,
            period=model.period,
            teacher_ids=model.teacher_ids,
            student_ids=[e.student_id for e in model.enrollments]
        )
