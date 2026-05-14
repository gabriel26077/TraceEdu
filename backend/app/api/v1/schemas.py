from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    name: str
    roles: List[str]
    email: Optional[EmailStr] = None
    cpf: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    uid: str
    name: str
    roles: List[str]
    email: Optional[str] = None
    cpf: Optional[str] = None

    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    name: str
    level: str
    grade: str
    academic_units: int
    assessments_per_unit: int = 3
    offering_type: str
    description: Optional[str] = None

class SubjectResponse(BaseModel):
    uid: str
    name: str
    level: str
    grade: str
    academic_units: int
    assessments_per_unit: int
    offering_type: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SubjectOfferingCreate(BaseModel):
    subject_id: str
    period: str
    class_group_id: Optional[str] = None
    teacher_ids: List[str] = []

class SubjectOfferingResponse(BaseModel):
    uid: str
    school_id: str
    subject_id: str
    class_group_id: str
    period: str
    teacher_ids: List[str]
    student_ids: List[str]

    class Config:
        from_attributes = True

class GradeCreate(BaseModel):
    unit: int
    assessment_number: int
    value: float
    observations: Optional[str] = None

class GradeResponse(BaseModel):
    uid: str
    offering_id: str
    student_id: str
    unit: int
    assessment_number: int
    value: float
    observations: Optional[str] = None

    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    student_id: str
    subject_offering_id: str

class EnrollmentResponse(BaseModel):
    uid: str
    student_id: str
    subject_offering_id: str
    status: str

    class Config:
        from_attributes = True

class ClassGroupCreate(BaseModel):
    name: str
    shift: str
    period: str
    is_regular: bool = False
    level: Optional[str] = None
    grade: Optional[str] = None
    notes: Optional[str] = None
    offering_ids: List[str] = []
    required_subject_ids: List[str] = []

class ClassGroupResponse(BaseModel):
    uid: str
    name: str
    shift: str
    period: str
    is_regular: bool
    level: Optional[str] = None
    grade: Optional[str] = None
    notes: Optional[str] = None
    student_ids: List[str]
    offering_ids: List[str]
    required_subject_ids: List[str]

    class Config:
        from_attributes = True

class EnrollStudentInGroupRequest(BaseModel):
    student_id: str

class GradePostRequest(BaseModel):
    term: int
    value: float
    grade_type: str = "regular"

class GradeReportItem(BaseModel):
    term: int
    value: float
    type: str

class StudentGradeReport(BaseModel):
    student_id: str
    student_name: str
    is_enrolled: bool
    grades: List[GradeReportItem]

class ClassReportResponse(BaseModel):
    class_group_name: str
    subject_offering_id: str
    students: List[StudentGradeReport]

class PasswordReset(BaseModel):
    new_password: str

class SchoolCreate(BaseModel):
    name: str
    coordination_email: str
    admin_name: str
    admin_email: str
    admin_password: str
    admin_cpf: Optional[str] = None

class SchoolResponse(BaseModel):
    uid: str
    name: str
    coordination_email: str
    status: str
    role: Optional[str] = None

    class Config:
        from_attributes = True
