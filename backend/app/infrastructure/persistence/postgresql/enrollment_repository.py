from sqlalchemy.orm import Session
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.infrastructure.database.models import EnrollmentModel

class SQLAlchemyEnrollmentRepository(EnrollmentRepository):
    def __init__(self, session: Session):
        self.session = session
    def save(self, enrollment: Enrollment) -> None:
        model = self.session.query(EnrollmentModel).filter_by(uid=enrollment.uid).first()
        if not model: model = EnrollmentModel(uid=enrollment.uid)
        model.school_id = enrollment.school_id
        model.student_id = enrollment.student_id
        model.subject_offering_id = enrollment.subject_offering_id
        model.status = str(enrollment.status)
        model.total_absences = enrollment.total_absences
        model.grades = [{"term": g.term, "value": g.value.value, "grade_type": str(g.grade_type)} for g in enrollment.grades]
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str):
        model = self.session.query(EnrollmentModel).filter_by(uid=uid).first()
        return self._to_entity(model) if model else None

    def get_by_student_and_offering(self, student_id: str, offering_id: str):
        model = self.session.query(EnrollmentModel).filter_by(student_id=student_id, subject_offering_id=offering_id).first()
        return self._to_entity(model) if model else None

    def list_by_offering(self, offering_id: str):
        models = self.session.query(EnrollmentModel).filter_by(subject_offering_id=offering_id).all()
        return [self._to_entity(m) for m in models]

    def _to_entity(self, model: EnrollmentModel):
        from app.domain.enrollment.entities.enrollment import EnrollmentStatus, Grade
        grades = [Grade(term=g["term"], value=g["value"], grade_type=g.get("grade_type", "regular")) for g in model.grades]
        return Enrollment(uid=model.uid, school_id=model.school_id, student_id=model.student_id,
                         subject_offering_id=model.subject_offering_id, status=EnrollmentStatus(model.status),
                         total_absences=model.total_absences, grades=grades)
