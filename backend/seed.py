import uuid
from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models import SchoolModel, UserModel, SchoolMemberModel, AccountModel
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
        
        db.commit()
        print(f"Database seeded with multi-school support.")
        print(f"User: {admin_user.name} | Login: admin@traceedu.com | Pass: admin123")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
