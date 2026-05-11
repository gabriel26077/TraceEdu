import pytest
from unittest.mock import Mock
from uuid import uuid4
from app.application.enrollment.post_grade_use_case import PostGradeUseCase, PostGradeInput
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects import AcademicGrade, GradeType
from app.domain.enrollment.policies import SubstitutionRecoveryPolicy

def test_post_regular_grade_successfully():
    # Arrange
    enroll_repo = Mock(spec=EnrollmentRepository)
    policy = SubstitutionRecoveryPolicy()
    use_case = PostGradeUseCase(enroll_repo, policy)
    
    enrollment_id = str(uuid4())
    enrollment = Enrollment(uid=enrollment_id, student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    enroll_repo.get_by_id.return_value = enrollment
    
    input_data = PostGradeInput(
        enrollment_id=enrollment_id,
        term=1,
        value=8.5,
        grade_type="regular"
    )
    
    # Act
    use_case.execute(input_data)
    
    # Assert
    assert len(enrollment.grades) == 1
    assert enrollment.grades[0].value.value == 8.5
    enroll_repo.save.assert_called_once()

def test_post_recovery_grade_applying_policy():
    # Arrange
    enroll_repo = Mock(spec=EnrollmentRepository)
    policy = SubstitutionRecoveryPolicy() # Policy que substitui se for maior
    use_case = PostGradeUseCase(enroll_repo, policy)
    
    enrollment_id = str(uuid4())
    enrollment = Enrollment(uid=enrollment_id, student_id=str(uuid4()), subject_offering_id=str(uuid4()))
    # Já tem uma nota 4.0
    enrollment.add_grade(Grade(uid="g1", term=1, value=AcademicGrade(4.0)))
    enroll_repo.get_by_id.return_value = enrollment
    
    # Lança recuperação de 9.0
    input_data = PostGradeInput(
        enrollment_id=enrollment_id,
        term=1,
        value=9.0,
        grade_type="recovery"
    )
    
    # Act
    use_case.execute(input_data)
    
    # Assert
    # A nota regular do termo 1 agora deve ser 9.0 (por causa da policy)
    regular_grade = next(g for g in enrollment.grades if g.term == 1 and g.grade_type == GradeType.REGULAR)
    assert regular_grade.value.value == 9.0
