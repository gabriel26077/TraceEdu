from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import router as api_router
from seed import seed_db
import os

app = FastAPI(title="TraceEdu API", description="Purist DDD API for TraceEdu", version="1.1.0")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    # Em desenvolvimento, garantimos que as tabelas existam e tenham dados
    if os.getenv("ENV") == "development":
        seed_db()

@app.get("/")
async def root():
    return {"message": "Welcome to TraceEdu API. Access /docs for documentation."}
