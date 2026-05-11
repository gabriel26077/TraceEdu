from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
def get_status():
    return {"status": "ok", "message": "TraceEdu API operating normally with Hexagonal Architecture!"}
