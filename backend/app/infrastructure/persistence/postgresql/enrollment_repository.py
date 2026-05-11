from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects import EnrollmentStatus, AcademicGrade, GradeType
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.infrastructure.database.models import EnrollmentModel

class SQLAlchemyEnrollmentRepository(EnrollmentRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, enrollment: Enrollment) -> None:
        model = self.session.query(EnrollmentModel).filter_by(uid=enrollment.uid).first()
        grades_data = [
            {
                "uid": g.uid,
                "term": g.term,
                "value": g.value.value,
                "type": g.grade_type.value
            } for g in enrollment.grades
        ]
        
        if model:
            model.status = enrollment.status.value
            model.grades = grades_data
        else:
            model = EnrollmentModel(
                uid=enrollment.uid,
                student_id=enrollment.student_id,
                subject_offering_id=enrollment.subject_offering_id,
                status=enrollment.status.value,
                grades=grades_data
            )
            self.session.add(model)
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[Enrollment]:
        model = self.session.query(EnrollmentModel).filter_by(uid=uid).first()
        return self._to_domain(model) if model else None

    def get_by_student_and_offering(self, student_id: str, offering_id: str) -> Optional[Enrollment]:
        model = self.session.query(EnrollmentModel).filter_by(
            student_id=student_id, 
            subject_offering_id=offering_id
        ).first()
        return self._to_domain(model) if model else None

    def _to_domain(self, model: EnrollmentModel) -> Enrollment:
        enrollment = Enrollment(
            uid=model.uid,
            student_id=model.student_id,
            subject_offering_id=model.subject_offering_id,
            status=EnrollmentStatus(model.status)
        )
        for g in model.grades:
            grade = Grade(
                uid=g["uid"],
                term=g["term"],
                value=AcademicGrade(g["value"]),
                grade_type=GradeType(g["type"])
            )
            enrollment.grades.append(grade)
        return enrollment
