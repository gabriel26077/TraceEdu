import pytest
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects.enrollment_status import EnrollmentStatus

def test_enrollment_creation():
    enrollment = Enrollment(uid="e1", school_id="sc1", student_id="u1", subject_offering_id="o1")
    assert enrollment.school_id == "sc1"
    # Compare with the Enum value or the Enum itself
    assert enrollment.status == EnrollmentStatus.ENROLLED

def test_add_grade():
    from app.domain.enrollment.value_objects.academic_grade import AcademicGrade
    enrollment = Enrollment(uid="e1", school_id="sc1", student_id="u1", subject_offering_id="o1")
    grade = Grade(term=1, value=AcademicGrade(8.5))
    enrollment.grades.append(grade)
    assert len(enrollment.grades) == 1
    assert enrollment.grades[0].value.value == 8.5
