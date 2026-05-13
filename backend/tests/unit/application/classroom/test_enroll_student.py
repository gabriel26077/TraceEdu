import pytest
from unittest.mock import Mock
from app.application.classroom.enroll_student_use_case import EnrollStudentUseCase, EnrollStudentInput
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository

def test_enroll_student_in_group_logic():
    # Setup mocks
    user_repo = Mock(spec=UserRepository)
    class_repo = Mock(spec=ClassGroupRepository)
    enroll_repo = Mock(spec=EnrollmentRepository)
    
    # Mock class group
    group = ClassGroup(uid="g1", school_id="s1", name="7A", shift="morning", base_subject_offering_ids=["o1"])
    class_repo.get_by_id.return_value = group
    
    # Mock enrollment search
    enroll_repo.get_by_student_and_offering.return_value = None
    
    use_case = EnrollStudentUseCase(user_repo, class_repo, enroll_repo)
    input_data = EnrollStudentInput(student_id="u1", class_group_id="g1")
    
    use_case.execute(input_data)
    
    # Verify student was added to group
    assert "u1" in group.student_ids
    class_repo.save.assert_called_with(group)
    # Verify enrollment was created
    assert enroll_repo.save.called
