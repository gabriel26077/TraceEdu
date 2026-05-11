from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.entities.subject_offering import SubjectOffering
from app.domain.classroom.value_objects import Shift
from app.domain.subject.value_objects import AcademicPeriod
from app.domain.classroom.repositories.classroom_repository import ClassGroupRepository, SubjectOfferingRepository
from app.infrastructure.database.models import ClassGroupModel, SubjectOfferingModel

class SQLAlchemyClassGroupRepository(ClassGroupRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, group: ClassGroup) -> None:
        model = self.session.query(ClassGroupModel).filter_by(uid=group.uid).first()
        if model:
            model.name = group.name
            model.shift = group.shift.value
            model.student_ids = group.student_ids
            model.base_subject_ids = group.base_subject_offering_ids
        else:
            model = ClassGroupModel(
                uid=group.uid,
                name=group.name,
                shift=group.shift.value,
                student_ids=group.student_ids,
                base_subject_ids=group.base_subject_offering_ids
            )
            self.session.add(model)
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[ClassGroup]:
        model = self.session.query(ClassGroupModel).filter_by(uid=uid).first()
        if not model:
            return None
        return ClassGroup(
            uid=model.uid,
            name=model.name,
            shift=Shift(model.shift),
            student_ids=model.student_ids,
            base_subject_offering_ids=model.base_subject_ids
        )

class SQLAlchemySubjectOfferingRepository(SubjectOfferingRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, offering: SubjectOffering) -> None:
        model = self.session.query(SubjectOfferingModel).filter_by(uid=offering.uid).first()
        if model:
            model.subject_id = offering.subject_id
            model.period = offering.period.value
            model.teacher_ids = offering.teacher_ids
        else:
            model = SubjectOfferingModel(
                uid=offering.uid,
                subject_id=offering.subject_id,
                period=offering.period.value,
                teacher_ids=offering.teacher_ids
            )
            self.session.add(model)
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[SubjectOffering]:
        model = self.session.query(SubjectOfferingModel).filter_by(uid=uid).first()
        if not model:
            return None
        return SubjectOffering(
            uid=model.uid,
            subject_id=model.subject_id,
            period=AcademicPeriod(model.period),
            teacher_ids=model.teacher_ids
        )

    def get_by_period(self, period: str) -> List[SubjectOffering]:
        models = self.session.query(SubjectOfferingModel).filter_by(period=period).all()
        return [
            SubjectOffering(
                uid=m.uid,
                subject_id=m.subject_id,
                period=AcademicPeriod(m.period),
                teacher_ids=m.teacher_ids
            ) for m in models
        ]
