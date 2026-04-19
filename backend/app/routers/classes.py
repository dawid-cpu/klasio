from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.class_ import Class
from app.schemas.class_ import ClassCreate, ClassOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("/", response_model=list[ClassOut])
def list_classes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    classes = db.query(Class).filter(Class.teacher_id == user.id).all()
    return [ClassOut(id=c.id, name=c.name, subject=c.subject, student_count=len(c.students)) for c in classes]


@router.post("/", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
def create_class(data: ClassCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    class_ = Class(**data.model_dump(), teacher_id=user.id)
    db.add(class_)
    db.commit()
    db.refresh(class_)
    return ClassOut(id=class_.id, name=class_.name, subject=class_.subject, student_count=0)


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    class_ = db.query(Class).filter(Class.id == class_id, Class.teacher_id == user.id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(class_)
    db.commit()
