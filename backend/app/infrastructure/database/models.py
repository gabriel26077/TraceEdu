from sqlalchemy import Column, Integer, String, ForeignKey, Date, JSON, Float, UniqueConstraint, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class SchoolModel(Base):
    __tablename__ = "schools"

    uid = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    representatives = Column(JSON, default=[]) 
    coordination_email = Column(String, nullable=True)
    coordination_phone = Column(String, nullable=True)
    settings = Column(JSON, default={})
    status = Column(String, default="active")

class UserModel(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    cpf = Column(String, unique=True, nullable=True)
    birthdate = Column(Date, nullable=True)
    global_roles = Column(JSON, default=[]) # e.g. ["platform_admin"]
    status = Column(String, default="active")

    account = relationship("AccountModel", back_populates="user", uselist=False)
    memberships = relationship("SchoolMemberModel", back_populates="user")

class SchoolMemberModel(Base):
    __tablename__ = "school_members"

    uid = Column(String, primary_key=True)
    school_id = Column(String, ForeignKey("schools.uid"), nullable=False)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    roles = Column(JSON, nullable=False) # Roles specific to THIS school
    status = Column(String, default="active")

    user = relationship("UserModel", back_populates="memberships")
    
    # Ensure a user has only one membership entry per school
    __table_args__ = (UniqueConstraint('school_id', 'user_id', name='_school_user_uc'),)

class AccountModel(Base):
    __tablename__ = "accounts"

    uid = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    status = Column(String, default="active")

    user = relationship("UserModel", back_populates="account")

class GradeModel(Base):
    __tablename__ = "grades"
    uid = Column(String, primary_key=True)
    offering_id = Column(String, ForeignKey("subject_offerings.uid"), nullable=False)
    student_id = Column(String, ForeignKey("users.uid"), nullable=False)
    unit = Column(Integer, nullable=False)
    assessment_number = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    observations = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint('offering_id', 'student_id', 'unit', 'assessment_number', name='_student_assessment_uc'),
    )

# Academic Entities (Always linked to a School)

class GlobalSubjectModel(Base):
    __tablename__ = "global_subjects"
    uid = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    level = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    academic_units = Column(Integer, nullable=False, default=3)
    assessments_per_unit = Column(Integer, nullable=False, default=3)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)

class SubjectModel(Base):
    __tablename__ = "subjects"
    uid = Column(String, primary_key=True)
    school_id = Column(String, ForeignKey("schools.uid"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(String, nullable=False)
    grade = Column(String, nullable=False) # e.g. "1", "2", "I"
    academic_units = Column(Integer, nullable=False)
    assessments_per_unit = Column(Integer, nullable=False, default=3)
    offering_type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    template_id = Column(String, nullable=True) # Ref to GlobalSubject

class ClassGroupModel(Base):
    __tablename__ = "class_groups"
    uid = Column(String, primary_key=True)
    school_id = Column(String, ForeignKey("schools.uid"), nullable=False)
    name = Column(String, nullable=False)
    shift = Column(String, nullable=False)
    period = Column(String, nullable=False)
    is_regular = Column(Boolean, default=False)
    level = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    student_ids = Column(JSON, default=[]) # Refs to User IDs
    offering_ids = Column(JSON, default=[]) # Refs to SubjectOffering IDs
    required_subject_ids = Column(JSON, default=[]) # Refs to Subject IDs

class SubjectOfferingModel(Base):
    __tablename__ = "subject_offerings"
    uid = Column(String, primary_key=True)
    school_id = Column(String, ForeignKey("schools.uid"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.uid"), nullable=False)
    class_group_id = Column(String, ForeignKey("class_groups.uid"), nullable=True)
    period = Column(String, nullable=False)
    teacher_ids = Column(JSON, default=[]) # Refs to User IDs
    
    enrollments = relationship("EnrollmentModel", back_populates="offering")


class EnrollmentModel(Base):
    __tablename__ = "enrollments"
    uid = Column(String, primary_key=True)
    school_id = Column(String, ForeignKey("schools.uid"), nullable=False)
    student_id = Column(String, ForeignKey("users.uid"), nullable=False)
    subject_offering_id = Column(String, ForeignKey("subject_offerings.uid"), nullable=False)
    total_absences = Column(Integer, default=0)
    status = Column(String, nullable=False)
    grades = Column(JSON, default=[])

    offering = relationship("SubjectOfferingModel", back_populates="enrollments")
