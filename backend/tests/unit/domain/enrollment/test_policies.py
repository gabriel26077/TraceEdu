import pytest
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects.academic_grade import AcademicGrade
from app.domain.enrollment.value_objects.grade_type import GradeType
from app.domain.enrollment.policies import SubstitutionRecoveryPolicy

def test_substitution_recovery_policy_should_replace_lower_grade():
    policy = SubstitutionRecoveryPolicy()
    enrollment = Enrollment(uid="e1", school_id="sc1", student_id="u1", subject_offering_id="o1")
    
    # Original grade: 5.0
    enrollment.add_grade(Grade(term=1, value=AcademicGrade(5.0), grade_type=GradeType.REGULAR))
    
    # Recovery grade: 8.0
    recovery_grade = Grade(term=1, value=AcademicGrade(8.0), grade_type=GradeType.RECOVERY)
    policy.apply(enrollment, recovery_grade)
    
    # The active grade for term 1 should now be 8.0
    # In our policy, it updates the regular grade in the list
    assert enrollment.grades[0].value.value == 8.0

def test_substitution_recovery_policy_should_not_replace_higher_grade():
    policy = SubstitutionRecoveryPolicy()
    enrollment = Enrollment(uid="e1", school_id="sc1", student_id="u1", subject_offering_id="o1")
    
    # Original grade: 9.0
    enrollment.add_grade(Grade(term=1, value=AcademicGrade(9.0), grade_type=GradeType.REGULAR))
    
    # Recovery grade: 7.0
    recovery_grade = Grade(term=1, value=AcademicGrade(7.0), grade_type=GradeType.RECOVERY)
    policy.apply(enrollment, recovery_grade)
    
    # Should stay 9.0
    assert enrollment.grades[0].value.value == 9.0
