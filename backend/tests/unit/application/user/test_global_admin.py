import pytest
from unittest.mock import Mock
from app.application.user.delete_user_use_case import DeleteUserUseCase
from app.infrastructure.database.models import UserModel
from fastapi import HTTPException

def test_delete_user_prevent_self_deletion():
    db = Mock()
    use_case = DeleteUserUseCase(db)
    
    with pytest.raises(HTTPException) as exc:
        use_case.execute("admin-id", "admin-id")
    
    assert exc.value.status_code == 400
    assert "cannot delete your own account" in exc.value.detail

def test_delete_user_success():
    db = Mock()
    # Mock user existence check
    user = Mock(spec=UserModel)
    user.uid = "target-user"
    db.query().filter_by().first.return_value = user
    
    use_case = DeleteUserUseCase(db)
    use_case.execute("target-user", "current-admin")
    
    # Verify that dependencies were deleted (Account and SchoolMember)
    # The current implementation uses db.query(Model).filter_by().delete()
    # Mocking this chain:
    assert db.query.called
    assert db.delete.called
    assert db.commit.called
