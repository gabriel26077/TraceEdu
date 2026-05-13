import pytest
from unittest.mock import Mock
from app.application.classroom.create_group_use_case import CreateGroupUseCase, CreateGroupInput
from app.domain.classroom.repositories.class_group_repository import ClassGroupRepository

def test_create_group_successfully():
    repo = Mock(spec=ClassGroupRepository)
    use_case = CreateGroupUseCase(repo)
    input_data = CreateGroupInput(school_id="s1", name="7A", shift="morning", base_offering_ids=["o1"])
    
    group = use_case.execute(input_data)
    assert group.name == "7A"
    assert group.school_id == "s1"
    assert repo.save.called
