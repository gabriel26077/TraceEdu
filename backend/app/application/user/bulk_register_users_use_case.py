import io
import csv
from typing import List
from app.domain.user.repositories.user_repository import UserRepository
from app.domain.school.repositories.membership_repository import SchoolMemberRepository
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput

class BulkRegisterUsersUseCase:
    def __init__(self, repository: UserRepository, member_repo: SchoolMemberRepository):
        self.repository = repository
        self.member_repo = member_repo
        self.register_use_case = RegisterUserUseCase(repository, member_repo)

    def execute(self, school_id: str, raw_csv: str, roles: List[str]) -> List[dict]:
        f = io.StringIO(raw_csv.strip())
        # Try to detect delimiter
        sample = f.readline()
        f.seek(0)
        
        delimiter = ','
        if ';' in sample:
            delimiter = ';'
            
        reader = csv.reader(f, delimiter=delimiter)
        
        results = []
        for row in reader:
            if not row or len(row) < 1:
                continue
                
            # Skip header if first row looks like one
            if row[0].lower() in ["name", "nome"]:
                continue
                
            name = row[0].strip()
            email = row[1].strip() if len(row) > 1 and row[1].strip() else None
            cpf = row[2].strip() if len(row) > 2 and row[2].strip() else None
            birthdate = row[3].strip() if len(row) > 3 and row[3].strip() else None
            
            try:
                user_input = RegisterUserInput(
                    name=name,
                    school_id=school_id,
                    roles=roles,
                    email=email,
                    cpf=cpf,
                    birthdate=birthdate
                )
                user = self.register_use_case.execute(user_input)
                results.append({"status": "success", "name": name, "uid": user.uid})
            except Exception as e:
                # If a DB error occurs, the session might be poisoned. 
                # The repository should handle its own session state if it was a flush error.
                results.append({"status": "error", "name": name, "error": str(e)})
                # We need to rollback to continue the loop
                if hasattr(self.repository, 'session'):
                    self.repository.session.rollback()
                
        return results
