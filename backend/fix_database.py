import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from app.infrastructure.database.models import Base

# Database URL from environment or default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://traceedu_user:traceedu_pass@localhost:5432/traceedu_db")

engine = create_engine(DATABASE_URL)

def fix():
    with engine.connect() as conn:
        print("--- Deep Cleaning Subject Offerings ---")
        try:
            # 1. Drop the foreign key constraint if it exists
            # The name is usually 'subject_offerings_class_group_id_fkey'
            conn.execute(text("ALTER TABLE subject_offerings DROP CONSTRAINT IF EXISTS subject_offerings_class_group_id_fkey"))
            print("Dropped foreign key constraint: subject_offerings_class_group_id_fkey")
        except Exception as e:
            print(f"Note: Could not drop constraint (might already be gone): {e}")

        try:
            # 2. Drop the column itself
            conn.execute(text("ALTER TABLE subject_offerings DROP COLUMN IF EXISTS class_group_id"))
            print("Dropped column: subject_offerings.class_group_id")
        except Exception as e:
            print(f"Note: Could not drop column (might already be gone): {e}")

        conn.commit()
        print("\nDatabase is now clean and synchronized with the new architecture!")

if __name__ == "__main__":
    fix()
