from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.academic.entities.grade import Grade
from app.domain.academic.repositories.grade_repository import GradeRepository
from app.infrastructure.database.models import GradeModel

class SQLAlchemyGradeRepository(GradeRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, grade: Grade) -> None:
        model = self.session.query(GradeModel).filter_by(uid=grade.uid).first()
        if not model:
            # Check if there is already a grade for this specific student/assessment to overwrite/update
            model = self.session.query(GradeModel).filter_by(
                offering_id=grade.offering_id,
                student_id=grade.student_id,
                unit=grade.unit,
                assessment_number=grade.assessment_number
            ).first()
            
            if not model:
                model = GradeModel(uid=grade.uid)

        model.offering_id = grade.offering_id
        model.student_id = grade.student_id
        model.unit = grade.unit
        model.assessment_number = grade.assessment_number
        model.value = grade.value
        model.observations = grade.observations
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[Grade]:
        model = self.session.query(GradeModel).filter_by(uid=uid).first()
        if not model: return None
        return self._to_domain(model)

    def list_by_offering(self, offering_id: str) -> List[Grade]:
        models = self.session.query(GradeModel).filter_by(offering_id=offering_id).all()
        return [self._to_domain(m) for m in models]

    def list_by_student(self, student_id: str) -> List[Grade]:
        models = self.session.query(GradeModel).filter_by(student_id=student_id).all()
        return [self._to_domain(m) for m in models]

    def get_specific_grade(self, offering_id: str, student_id: str, unit: int, assessment_number: int) -> Optional[Grade]:
        model = self.session.query(GradeModel).filter_by(
            offering_id=offering_id,
            student_id=student_id,
            unit=unit,
            assessment_number=assessment_number
        ).first()
        if not model: return None
        return self._to_domain(model)

    def _to_domain(self, model: GradeModel) -> Grade:
        return Grade(
            uid=model.uid,
            offering_id=model.offering_id,
            student_id=model.student_id,
            unit=model.unit,
            assessment_number=model.assessment_number,
            value=model.value,
            observations=model.observations
        )
