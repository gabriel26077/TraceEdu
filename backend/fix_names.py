from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.infrastructure.database.models import GlobalSubjectModel

# Database connection
DATABASE_URL = "postgresql://traceedu_user:traceedu_pass@localhost:5432/traceedu_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

TRANSLATIONS = {
    "Mathematics": "MATEMÁTICA",
    "Portuguese": "PORTUGUÊS",
    "Science": "CIÊNCIAS",
    "History": "HISTÓRIA",
    "Geography": "GEOGRAFIA",
    "Arts": "ARTE",
    "Art": "ARTE",
    "English": "INGLÊS",
    "Physical Education": "EDUCAÇÃO FÍSICA",
    "Physics": "FÍSICA",
    "Chemistry": "QUÍMICA",
    "Biology": "BIOLOGIA",
    "Philosophy": "FILOSOFIA",
    "Sociology": "SOCIOLOGIA"
}

def clean_and_fix_names():
    db = SessionLocal()
    subjects = db.query(GlobalSubjectModel).all()
    
    count = 0
    for sub in subjects:
        new_name = sub.name
        
        # 1. Translate if in dictionary
        for eng, pt in TRANSLATIONS.items():
            if eng.lower() in new_name.lower():
                new_name = pt
                break
        
        # 2. Uppercase and remove trailing numbers for clean start
        # If it's already "MATEMÁTICA 1", we want just "MATEMÁTICA" first
        base_name = new_name.split(' ')[0].upper()
        # Exception for multi-word names like EDUCAÇÃO FÍSICA
        if "EDUCAÇÃO" in new_name.upper():
            base_name = "EDUCAÇÃO FÍSICA"
        if "PRODUÇÃO" in new_name.upper():
            base_name = "PRODUÇÃO TEXTUAL"

        # 3. Final format: BASE_NAME GRADE
        final_name = f"{base_name} {sub.grade}"
        
        if sub.name != final_name:
            sub.name = final_name
            count += 1
            
    db.commit()
    print(f"Successfully cleaned and standardized {count} subject names!")
    db.close()

if __name__ == "__main__":
    clean_and_fix_names()
