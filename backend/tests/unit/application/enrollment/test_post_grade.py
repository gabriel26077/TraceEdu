import pytest
from unittest.mock import Mock
from app.application.enrollment.post_grade_use_case import PostGradeUseCase, PostGradeInput
from app.domain.enrollment.entities.enrollment import Enrollment
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.enrollment.policies import SubstitutionRecoveryPolicy

def test_post_regular_grade_successfully():
    repo = Mock(spec=EnrollmentRepository)
    policy = Mock(spec=SubstitutionRecoveryPolicy)
    use_case = PostGradeUseCase(repo, policy)
    
    enrollment = Enrollment(uid="e1", school_id="s1", student_id="u1", subject_offering_id="o1")
    repo.get_by_id.return_value = enrollment
    
    input_data = PostGradeInput(enrollment_id="e1", term=1, value=8.0)
    use_case.execute(input_data)
    
    assert repo.save.called

def test_post_recovery_grade_applying_policy():
    repo = Mock(spec=EnrollmentRepository)
    policy = Mock(spec=SubstitutionRecoveryPolicy)
    use_case = PostGradeUseCase(repo, policy)
    
    enrollment = Enrollment(uid="e1", school_id="s1", student_id="u1", subject_offering_id="o1")
    repo.get_by_id.return_value = enrollment
    
    input_data = PostGradeInput(enrollment_id="e1", term=1, value=7.0, grade_type="recovery")
    use_case.execute(input_data)
    
    assert policy.apply.called
