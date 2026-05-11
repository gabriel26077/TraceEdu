from sqlalchemy import Column, Integer, String, ForeignKey, Date, JSON, Float
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    birthdate = Column(Date, nullable=True)
    cpf = Column(String, nullable=True)
    roles = Column(JSON, nullable=False) # List of roles as JSONB

    account = relationship("AccountModel", back_populates="user", uselist=False)

class AccountModel(Base):
    __tablename__ = "accounts"

    uid = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    status = Column(String, default="active")

    user = relationship("UserModel", back_populates="account")

class SubjectModel(Base):
    __tablename__ = "subjects"

    uid = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    level = Column(String, nullable=False)
    academic_units = Column(Integer, nullable=False)
    offering_type = Column(String, nullable=False)
    description = Column(String, nullable=True)

class ClassGroupModel(Base):
    __tablename__ = "class_groups"

    uid = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    shift = Column(String, nullable=False)
    student_ids = Column(JSON, default=[]) # List of student UIDs
    base_subject_ids = Column(JSON, default=[]) # List of subject offering UIDs

class SubjectOfferingModel(Base):
    __tablename__ = "subject_offerings"

    uid = Column(String, primary_key=True)
    subject_id = Column(String, ForeignKey("subjects.uid"), nullable=False)
    period = Column(String, nullable=False)
    teacher_ids = Column(JSON, default=[]) # List of teacher UIDs

class EnrollmentModel(Base):
    __tablename__ = "enrollments"

    uid = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("users.uid"), nullable=False)
    subject_offering_id = Column(String, ForeignKey("subject_offerings.uid"), nullable=False)
    total_absences = Column(Integer, default=0)
    status = Column(String, nullable=False)

    grades = relationship("GradeModel", back_populates="enrollment", cascade="all, delete-orphan")

class GradeModel(Base):
    __tablename__ = "grades"

    uid = Column(String, primary_key=True)
    enrollment_id = Column(String, ForeignKey("enrollments.uid"), nullable=False)
    term = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    grade_type = Column(String, nullable=False)

    enrollment = relationship("EnrollmentModel", back_populates="grades")
