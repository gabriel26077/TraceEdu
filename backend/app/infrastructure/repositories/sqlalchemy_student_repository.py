from typing import List
from sqlalchemy.orm import Session
from app.domain.student.entity import Student
from app.domain.student.repository_interface import IStudentRepository
from app.infrastructure.database.models import StudentModel

class SQLAlchemyStudentRepository(IStudentRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Student]:
        models = self.db.query(StudentModel).all()
        return [
            Student(id=m.id, name=m.name, grade=m.grade, status=m.status)
            for m in models
        ]

    def get_by_id(self, student_id: int) -> Student:
        model = self.db.query(StudentModel).filter(StudentModel.id == student_id).first()
        if not model:
            return None
        return Student(id=model.id, name=model.name, grade=model.grade, status=model.status)

    def save(self, student: Student) -> Student:
        model = StudentModel(
            id=student.id,
            name=student.name,
            grade=student.grade,
            status=student.status
        )
        self.db.merge(model) # merge handles create or update
        self.db.commit()
        return student
