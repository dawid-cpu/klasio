from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.class_ import Class
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/classes/{class_id}/students", tags=["students"])


def get_class_or_404(class_id: int, user: User, db: Session) -> Class:
    class_ = db.query(Class).filter(Class.id == class_id, Class.teacher_id == user.id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_


@router.get("/", response_model=list[StudentOut])
def list_students(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    return db.query(Student).filter(Student.class_id == class_id).order_by(Student.student_number).all()


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(class_id: int, data: StudentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    student = Student(**data.model_dump(), class_id=class_id)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(class_id: int, student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    student = db.query(Student).filter(Student.id == student_id, Student.class_id == class_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
