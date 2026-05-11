import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.infrastructure.database.models import Base
from app.infrastructure.persistence.postgresql.user_repository import SQLAlchemyUserRepository
from app.domain.user.entities.user import User
from app.domain.user.value_objects import UserRole, CPF, Email

# Setup SQLite in-memory for fast integration testing
engine = create_engine("sqlite:///:memory:")
SessionLocal = sessionmaker(bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_user_repository_integration(db_session):
    # 1. Arrange
    repository = SQLAlchemyUserRepository(db_session)
    user = User(
        uid="user-123",
        name="Integration Test User",
        roles=[UserRole.ADMIN, UserRole.TEACHER],
        email=Email("test@traceedu.com"),
        cpf=CPF("12345678909")
    )
    
    # 2. Act
    repository.save(user)
    
    # 3. Assert
    retrieved_user = repository.get_by_id("user-123")
    assert retrieved_user is not None
    assert retrieved_user.name == "Integration Test User"
    assert retrieved_user.email.value == "test@traceedu.com"
    assert UserRole.ADMIN in retrieved_user.roles
    assert len(retrieved_user.roles) == 2
