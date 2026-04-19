from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.class_ import Class
from app.models.grade import Grade, GradeCategory
from app.models.student import Student
from app.schemas.grade import GradeCreate, GradeOut, GradeCategoryCreate, GradeCategoryOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/classes/{class_id}", tags=["grades"])


def get_class_or_404(class_id: int, user: User, db: Session) -> Class:
    class_ = db.query(Class).filter(Class.id == class_id, Class.teacher_id == user.id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_


@router.get("/categories", response_model=list[GradeCategoryOut])
def list_categories(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    return db.query(GradeCategory).filter(GradeCategory.class_id == class_id).all()


@router.post("/categories", response_model=GradeCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(class_id: int, data: GradeCategoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    cat = GradeCategory(**data.model_dump(), class_id=class_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.post("/grades", response_model=GradeOut, status_code=status.HTTP_201_CREATED)
def add_grade(class_id: int, data: GradeCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    grade = Grade(**data.model_dump(), class_id=class_id)
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/grades/summary")
def grades_summary(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    students = db.query(Student).filter(Student.class_id == class_id).all()
    categories = db.query(GradeCategory).filter(GradeCategory.class_id == class_id).all()
    total_weight = sum(c.weight for c in categories) or 1

    summary = []
    for student in students:
        weighted_sum = 0.0
        grade_count = 0
        for cat in categories:
            grades = db.query(Grade).filter(Grade.student_id == student.id, Grade.category_id == cat.id).all()
            if grades:
                avg = sum(g.value for g in grades) / len(grades)
                weighted_sum += avg * cat.weight
                grade_count += 1
        average = round(weighted_sum / total_weight, 2) if grade_count > 0 else None
        summary.append({
            "student_id": student.id,
            "name": f"{student.first_name} {student.last_name}",
            "average": average,
            "at_risk": average is not None and average < 2.0,
        })
    return summary
