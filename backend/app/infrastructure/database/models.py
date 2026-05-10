from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class StudentModel(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    status = Column(String, nullable=False)

    def __repr__(self):
        return f"<StudentModel(name='{self.name}', grade='{self.grade}')>"
