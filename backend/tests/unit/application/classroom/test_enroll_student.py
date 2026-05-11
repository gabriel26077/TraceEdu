import pytest
from unittest.mock import Mock, call
from uuid import uuid4
from app.application.classroom.enroll_student_use_case import EnrollStudentUseCase, EnrollStudentInput
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.classroom.repositories.classroom_repository import ClassGroupRepository, SubjectOfferingRepository
from app.domain.enrollment.repositories.enrollment_repository import EnrollmentRepository
from app.domain.user.entities.user import User
from app.domain.classroom.entities.class_group import ClassGroup
from app.domain.classroom.value_objects import Shift

def test_enroll_student_in_class_group_successfully():
    # Arrange
    user_repo = Mock(spec=UserRepository)
    class_repo = Mock(spec=ClassGroupRepository)
    enroll_repo = Mock(spec=EnrollmentRepository)
    
    student_id = str(uuid4())
    class_id = str(uuid4())
    offering_ids = [str(uuid4()), str(uuid4())] # Duas matérias na turma
    
    # Mocks de retorno
    user_repo.get_by_id.return_value = Mock(spec=User, uid=student_id)
    class_repo.get_by_id.return_value = ClassGroup(
        uid=class_id, 
        name="7A", 
        shift=Shift.MORNING,
        base_subject_offering_ids=offering_ids
    )
    
    use_case = EnrollStudentUseCase(user_repo, class_repo, enroll_repo)
    input_data = EnrollStudentInput(student_id=student_id, class_group_id=class_id)
    
    # Act
    use_case.execute(input_data)
    
    # Assert
    # Deve ter criado 2 matrículas (uma para cada matéria da turma)
    assert enroll_repo.save.call_count == 2
    
    # O aluno deve ter sido adicionado à turma
    class_repo.save.assert_called_once()
    saved_class = class_repo.save.call_args[0][0]
    assert student_id in saved_class.student_ids
