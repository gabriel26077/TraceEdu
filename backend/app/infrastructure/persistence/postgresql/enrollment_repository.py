from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects import AcademicGrade, EnrollmentStatus, GradeType
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.infrastructure.database.models import EnrollmentModel, GradeModel

class SQLAlchemyEnrollmentRepository(EnrollmentRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, enrollment: Enrollment) -> None:
        model = self.session.query(EnrollmentModel).filter_by(uid=enrollment.uid).first()
        
        if model:
            model.total_absences = enrollment.total_absences
            model.status = enrollment.status.value
            # For simplicity in this example, we clear and re-add grades
            # In a production environment, we would sync them specifically
            self.session.query(GradeModel).filter_by(enrollment_id=enrollment.uid).delete()
        else:
            model = EnrollmentModel(
                uid=enrollment.uid,
                student_id=enrollment.student_id,
                subject_offering_id=enrollment.subject_offering_id,
                total_absences=enrollment.total_absences,
                status=enrollment.status.value
            )
            self.session.add(model)
        
        # Add grades
        for grade in enrollment.grades:
            grade_model = GradeModel(
                uid=grade.uid,
                enrollment_id=enrollment.uid,
                term=grade.term,
                value=grade.value.value,
                grade_type=grade.grade_type.value
            )
            self.session.add(grade_model)
            
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[Enrollment]:
        model = self.session.query(EnrollmentModel).filter_by(uid=uid).first()
        if not model:
            return None
        return self._to_domain(model)

    def get_by_student(self, student_id: str) -> List[Enrollment]:
        models = self.session.query(EnrollmentModel).filter_by(student_id=student_id).all()
        return [self._to_domain(model) for model in models]

    def _to_domain(self, model: EnrollmentModel) -> Enrollment:
        grades = [
            Grade(
                uid=g.uid,
                term=g.term,
                value=AcademicGrade(g.value),
                grade_type=GradeType(g.grade_type)
            ) for g in model.grades
        ]
        
        return Enrollment(
            uid=model.uid,
            student_id=model.student_id,
            subject_offering_id=model.subject_offering_id,
            total_absences=model.total_absences,
            status=EnrollmentStatus(model.status),
            grades=grades
        )
