import uuid
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.infrastructure.database.models import GlobalSubjectModel

# Database connection
DATABASE_URL = "postgresql://traceedu_user:traceedu_pass@localhost:5432/traceedu_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_base_subjects():
    db = SessionLocal()
    
    subjects_list = [
        "PORTUGUÊS", "MATEMÁTICA", "CIÊNCIAS", "HISTÓRIA", 
        "GEOGRAFIA", "ARTE", "INGLÊS", "EDUCAÇÃO FÍSICA",
        "PRODUÇÃO TEXTUAL", "ESPANHOL"
    ]
    
    # Fundamental 1 (1-5)
    f1_years = ["1", "2", "3", "4", "5"]
    # Fundamental 2 (6-9)
    f2_years = ["6", "7", "8", "9"]
    # Ensino Médio (I-IV)
    em_years = ["I", "II", "III", "IV"]
    
    levels = [
        ("fundamental_1", f1_years),
        ("fundamental_2", f2_years),
        ("ensino_medio", em_years)
    ]
    
    count = 0
    for level_id, years in levels:
        for year in years:
            # Skip 1st year Fundamental 1 as user mentioned they already did it
            # But to be safe, we'll check existence for everything
            for sub_name in subjects_list:
                # Check if exists
                exists = db.query(GlobalSubjectModel).filter_by(
                    name=sub_name, 
                    level=level_id, 
                    grade=year
                ).first()
                
                if not exists:
                    new_sub = GlobalSubjectModel(
                        uid=str(uuid.uuid4()),
                        name=sub_name,
                        level=level_id,
                        grade=year,
                        academic_units=3,
                        category="Core",
                        description=f"{sub_name} for {year} grade"
                    )
                    db.add(new_sub)
                    count += 1
    
    db.commit()
    print(f"Successfully seeded {count} new base subjects!")
    db.close()

if __name__ == "__main__":
    seed_base_subjects()
