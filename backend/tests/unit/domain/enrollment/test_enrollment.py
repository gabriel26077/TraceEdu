import pytest
from uuid import uuid4
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects import AcademicGrade, EnrollmentStatus, GradeType
from app.domain.exceptions import DomainException

def test_grade_creation():
    uid = str(uuid4())
    value = AcademicGrade(8.5)
    grade = Grade(uid=uid, term=1, value=value, grade_type=GradeType.REGULAR)
    
    assert grade.uid == uid
    assert grade.value.value == 8.5
    assert grade.grade_type == GradeType.REGULAR

def test_enrollment_should_be_created_with_valid_data():
    uid = str(uuid4())
    student_id = str(uuid4())
    offering_id = str(uuid4())
    
    enrollment = Enrollment(
        uid=uid,
        student_id=student_id,
        subject_offering_id=offering_id
    )
    
    assert enrollment.uid == uid
    assert enrollment.status == EnrollmentStatus.ENROLLED
    assert enrollment.total_absences == 0
    assert len(enrollment.grades) == 0

def test_add_grade_to_enrollment():
    enrollment = Enrollment(uid=str(uuid4()), student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    grade = Grade(uid=str(uuid4()), term=1, value=AcademicGrade(7.0), grade_type=GradeType.REGULAR)
    
    enrollment.add_grade(grade)
    assert len(enrollment.grades) == 1
    assert enrollment.grades[0].value.value == 7.0

def test_add_absences():
    enrollment = Enrollment(uid=str(uuid4()), student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    enrollment.add_absences(5)
    assert enrollment.total_absences == 5
    
    with pytest.raises(DomainException):
        enrollment.add_absences(-1)
