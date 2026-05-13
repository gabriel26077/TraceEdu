import uuid
from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models import SchoolModel, UserModel, SchoolMemberModel, AccountModel, GlobalSubjectModel
from app.infrastructure.security.auth_service import AuthService

def seed_db():
    db = SessionLocal()
    auth = AuthService()
    try:
        # 1. Create Default School
        school_id = str(uuid.uuid4())
        default_school = SchoolModel(
            uid=school_id,
            name="TraceEdu International School",
            coordination_email="contact@traceedu.com"
        )
        db.add(default_school)
        
        # 2. Create Global User (Admin)
        user_id = str(uuid.uuid4())
        admin_user = UserModel(
            uid=user_id,
            name="Gabriel Super Admin",
            email="admin@traceedu.com",
            global_roles=["platform_admin"]
        )
        db.add(admin_user)
        
        # 3. Create Account (Credentials)
        password_hash = auth.get_password_hash("admin123")
        account = AccountModel(
            uid=str(uuid.uuid4()),
            user_id=user_id,
            username="admin@traceedu.com",
            password_hash=password_hash
        )
        db.add(account)
        
        # 4. Create Membership
        membership = SchoolMemberModel(
            uid=str(uuid.uuid4()),
            school_id=school_id,
            user_id=user_id,
            roles=["admin"],
            status="active"
        )
        db.add(membership)

        # 5. Create Global Subjects (Base Catalog)
        base_subjects = [
            # Fundamental 1 - 1st Year
            ("Mathematics 1", "fundamental_1", "1", "Mathematics", "Basic numbers and shapes"),
            ("Portuguese 1", "fundamental_1", "1", "Language", "Literacy and basic reading"),
            ("Science 1", "fundamental_1", "1", "Science", "Nature and environment"),
            
            # Fundamental 1 - 2nd Year
            ("Mathematics 2", "fundamental_1", "2", "Mathematics", "Addition and subtraction"),
            ("Portuguese 2", "fundamental_1", "2", "Language", "Writing and interpretation"),
            
            # Fundamental 2 - 6th Year
            ("Mathematics 6", "fundamental_2", "6", "Mathematics", "Fractions and geometry"),
            ("Portuguese 6", "fundamental_2", "6", "Language", "Literature and grammar"),
            
            # High School - 1st Year
            ("Mathematics I", "ensino_medio", "I", "Mathematics", "Functions and algebra"),
            ("Portuguese I", "ensino_medio", "I", "Language", "Modernism and analysis"),
        ]
        
        for name, level, grade, category, desc in base_subjects:
            gs = GlobalSubjectModel(
                uid=str(uuid.uuid4()),
                name=name,
                level=level,
                grade=grade,
                category=category,
                description=desc
            )
            db.add(gs)
        
        db.commit()
        print(f"Database seeded with multi-school support and BNCC Catalog.")
        print(f"User: {admin_user.name} | Login: admin@traceedu.com | Pass: admin123")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
