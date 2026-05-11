from app.infrastructure.database.session import SessionLocal, engine
from app.infrastructure.database.models import Base

def seed_db():
    Base.metadata.create_all(bind=engine)
    # Seed data will be added here for the new domain entities
    print("Database structure initialized.")

if __name__ == "__main__":
    seed_db()
