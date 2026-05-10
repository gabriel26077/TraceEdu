from app.infrastructure.database.session import SessionLocal, engine
from app.infrastructure.database.models import Base, StudentModel

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already have students
    if db.query(StudentModel).count() == 0:
        print("Seeding database...")
        students = [
            StudentModel(name="Ana Silva", grade="1º Ano B", status="Aprovada"),
            StudentModel(name="João Souza", grade="2º Ano A", status="Em Recuperação"),
            StudentModel(name="Mariana Costa", grade="3º Ano C", status="Aprovada"),
            StudentModel(name="Carlos Oliveira", grade="1º Ano A", status="Aprovado"),
        ]
        db.add_all(students)
        db.commit()
        print("Database seeded!")
    else:
        print("Database already has data, skipping seed.")
    db.close()

if __name__ == "__main__":
    seed_db()
