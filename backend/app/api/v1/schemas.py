from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    name: str
    roles: List[str]
    email: Optional[EmailStr] = None
    cpf: Optional[str] = None

class UserResponse(BaseModel):
    uid: str
    name: str
    roles: List[str]
    email: Optional[str] = None
    cpf: Optional[str] = None

    class Config:
        from_attributes = True
