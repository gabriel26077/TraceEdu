from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.infrastructure.security.auth_service import AuthService
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import UserModel
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    auth_service = AuthService()
    payload = auth_service.decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = db.query(UserModel).filter_by(uid=user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user
def verify_platform_admin(current_user: UserModel = Depends(get_current_user)):
    if "platform_admin" not in (current_user.global_roles or []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access restricted to platform administrators"
        )
    return current_user

def verify_school_access(school_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    from app.infrastructure.database.models import SchoolModel, SchoolMemberModel
    school = db.query(SchoolModel).filter_by(uid=school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    is_platform_admin = "platform_admin" in (current_user.global_roles or [])
    
    if school.status == "archived" and not is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="School is archived and cannot be accessed"
        )
        
    if not is_platform_admin:
        membership = db.query(SchoolMemberModel).filter_by(school_id=school_id, user_id=current_user.uid).first()
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this school"
            )
            
    return school

def verify_school_admin(school_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    from app.infrastructure.database.models import SchoolModel, SchoolMemberModel
    
    # 1. Platform admins bypass everything
    is_platform_admin = "platform_admin" in (current_user.global_roles or [])
    if is_platform_admin:
        school = db.query(SchoolModel).filter_by(uid=school_id).first()
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        return school

    # 2. Check school membership and role
    membership = db.query(SchoolMemberModel).filter_by(school_id=school_id, user_id=current_user.uid).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this school"
        )
    
    # Check if "admin" is in the JSON list of roles
    user_roles = membership.roles or []
    if "admin" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this action"
        )
    
    school = db.query(SchoolModel).filter_by(uid=school_id).first()
    return school
