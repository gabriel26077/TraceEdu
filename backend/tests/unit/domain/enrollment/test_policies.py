import pytest
from uuid import uuid4
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects import AcademicGrade, EnrollmentStatus, GradeType
from app.domain.enrollment.policies import SimpleAveragePromotionPolicy, SubstitutionRecoveryPolicy

def test_simple_average_policy_approval():
    policy = SimpleAveragePromotionPolicy(min_grade=6.0)
    enrollment = Enrollment(uid=str(uuid4()), student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    enrollment.add_grade(Grade(uid=str(uuid4()), term=1, value=AcademicGrade(6.0)))
    
    assert policy.evaluate(enrollment) == EnrollmentStatus.APPROVED

def test_substitution_recovery_policy_should_replace_lower_grade():
    policy = SubstitutionRecoveryPolicy()
    enrollment = Enrollment(uid=str(uuid4()), student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    
    # Regular grade was 4.0
    enrollment.add_grade(Grade(uid="g1", term=1, value=AcademicGrade(4.0), grade_type=GradeType.REGULAR))
    
    # Recovery grade is 8.0
    recovery = Grade(uid="g2", term=1, value=AcademicGrade(8.0), grade_type=GradeType.RECOVERY)
    
    policy.apply(enrollment, recovery)
    
    # The 'active' grade for term 1 should now be 8.0
    regular_grade = next(g for g in enrollment.grades if g.term == 1 and g.grade_type == GradeType.REGULAR)
    assert regular_grade.value.value == 8.0
    assert len(enrollment.grades) == 2 # History kept both

def test_substitution_recovery_policy_should_not_replace_higher_grade():
    policy = SubstitutionRecoveryPolicy()
    enrollment = Enrollment(uid=str(uuid4()), student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    
    # Regular grade was 9.0
    enrollment.add_grade(Grade(uid="g1", term=1, value=AcademicGrade(9.0), grade_type=GradeType.REGULAR))
    
    # Recovery grade is 5.0
    recovery = Grade(uid="g2", term=1, value=AcademicGrade(5.0), grade_type=GradeType.RECOVERY)
    
    policy.apply(enrollment, recovery)
    
    # The 'active' grade for term 1 should remain 9.0
    regular_grade = next(g for g in enrollment.grades if g.term == 1 and g.grade_type == GradeType.REGULAR)
    assert regular_grade.value.value == 9.0
