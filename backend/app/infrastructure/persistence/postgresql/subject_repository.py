from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.subject.entities.subject import Subject
from app.domain.subject.repositories.subject_repository import SubjectRepository
from app.infrastructure.database.models import SubjectModel

class SQLAlchemySubjectRepository(SubjectRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, subject: Subject) -> None:
        model = self.session.query(SubjectModel).filter_by(uid=subject.uid).first()
        if not model:
            model = SubjectModel(uid=subject.uid)
        
        model.school_id = subject.school_id
        model.name = subject.name
        model.level = subject.level
        model.academic_units = subject.academic_units
        model.offering_type = subject.offering_type
        model.description = subject.description
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[Subject]:
        model = self.session.query(SubjectModel).filter_by(uid=uid).first()
        if not model: return None
        return Subject(
            uid=model.uid,
            school_id=model.school_id,
            name=model.name,
            level=model.level,
            academic_units=model.academic_units,
            offering_type=model.offering_type,
            description=model.description
        )

    def list_by_school(self, school_id: str) -> List[Subject]:
        models = self.session.query(SubjectModel).filter_by(school_id=school_id).all()
        return [self.get_by_id(m.uid) for m in models]
