from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, classes, students, attendance, grades

app = FastAPI(title="Klasio API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(grades.router)


@app.get("/health")
def health():
    return {"status": "ok"}
