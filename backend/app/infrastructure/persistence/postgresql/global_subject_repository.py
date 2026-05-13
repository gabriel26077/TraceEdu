from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.subject.entities.global_subject import GlobalSubject
from app.domain.subject.repositories.global_subject_repository import GlobalSubjectRepository
from app.infrastructure.database.models import GlobalSubjectModel

class SQLAlchemyGlobalSubjectRepository(GlobalSubjectRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, subject: GlobalSubject) -> None:
        model = self.session.query(GlobalSubjectModel).filter_by(uid=subject.uid).first()
        if not model:
            model = GlobalSubjectModel(uid=subject.uid)
        
        model.name = subject.name
        model.level = subject.level
        model.grade = subject.grade
        model.academic_units = subject.academic_units
        model.description = subject.description
        model.category = subject.category
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[GlobalSubject]:
        model = self.session.query(GlobalSubjectModel).filter_by(uid=uid).first()
        if not model: return None
        return GlobalSubject(
            uid=model.uid,
            name=model.name,
            level=model.level,
            grade=model.grade,
            academic_units=model.academic_units,
            description=model.description,
            category=model.category
        )

    def list_all(self) -> List[GlobalSubject]:
        models = self.session.query(GlobalSubjectModel).all()
        return [GlobalSubject(
            uid=m.uid,
            name=m.name,
            level=m.level,
            grade=m.grade,
            academic_units=m.academic_units,
            description=m.description,
            category=m.category
        ) for m in models]

    def delete(self, uid: str) -> None:
        model = self.session.query(GlobalSubjectModel).filter_by(uid=uid).first()
        if model:
            self.session.delete(model)
            self.session.flush()
