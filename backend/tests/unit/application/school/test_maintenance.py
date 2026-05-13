import pytest
from unittest.mock import Mock
from app.application.school.maintenance_use_cases import ArchiveSchoolUseCase, ActivateSchoolUseCase
from app.domain.school.repositories.school_repository import SchoolRepository
from app.domain.school.entities.school import School

@pytest.fixture
def school_repo():
    return Mock(spec=SchoolRepository)

def test_archive_school_success(school_repo):
    db = Mock()
    school = School(uid="sc1", name="Test School", coordination_email="test@school.com", status="active")
    school_repo.get_by_id.return_value = school
    
    use_case = ArchiveSchoolUseCase(school_repo, db)
    use_case.execute("sc1")
    
    assert school_repo.save.called
    assert db.commit.called

def test_activate_school_success(school_repo):
    db = Mock()
    school = School(uid="sc1", name="Test School", coordination_email="test@school.com", status="archived")
    school_repo.get_by_id.return_value = school
    
    use_case = ActivateSchoolUseCase(school_repo, db)
    use_case.execute("sc1")
    
    assert school_repo.save.called
    assert db.commit.called
