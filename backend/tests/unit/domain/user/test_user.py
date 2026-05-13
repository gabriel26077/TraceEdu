import pytest
from app.domain.user.entities.user import User

def test_user_creation():
    # User now has global roles [] by default. Institutional roles are in SchoolMember
    user = User(uid="u1", name="Gabriel")
    assert user.name == "Gabriel"
    assert user.roles == []
    assert not user.is_admin() # Not a platform admin

def test_platform_admin_creation():
    user = User(uid="u1", name="Super", roles=["platform_admin"])
    assert user.is_admin()
