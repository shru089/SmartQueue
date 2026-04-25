from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import queue, admin

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartQueue API", version="1.0.0")

# CORS config to allow frontend to communicate (when we connect them later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(queue.router)
# app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "SmartQueue API is running. Not connected to frontend yet."}
