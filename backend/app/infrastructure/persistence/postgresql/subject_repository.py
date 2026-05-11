from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.subject.entities.subject import Subject
from app.domain.subject.value_objects import SubjectLevel, OfferingType
from app.domain.subject.repositories.subject_repository import SubjectRepository
from app.infrastructure.database.models import SubjectModel

class SQLAlchemySubjectRepository(SubjectRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, subject: Subject) -> None:
        model = self.session.query(SubjectModel).filter_by(uid=subject.uid).first()
        
        if model:
            model.name = subject.name
            model.level = subject.level.value
            model.academic_units = subject.academic_units
            model.offering_type = subject.offering_type.value
            model.description = subject.description
        else:
            model = SubjectModel(
                uid=subject.uid,
                name=subject.name,
                level=subject.level.value,
                academic_units=subject.academic_units,
                offering_type=subject.offering_type.value,
                description=subject.description
            )
            self.session.add(model)
        
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[Subject]:
        model = self.session.query(SubjectModel).filter_by(uid=uid).first()
        if not model:
            return None
        return self._to_domain(model)

    def get_all(self) -> List[Subject]:
        models = self.session.query(SubjectModel).all()
        return [self._to_domain(model) for model in models]

    def _to_domain(self, model: SubjectModel) -> Subject:
        return Subject(
            uid=model.uid,
            name=model.name,
            level=SubjectLevel(model.level),
            academic_units=model.academic_units,
            offering_type=OfferingType(model.offering_type),
            description=model.description
        )
