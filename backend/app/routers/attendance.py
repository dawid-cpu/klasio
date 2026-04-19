from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.class_ import Class
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceBulk, AttendanceOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/classes/{class_id}/attendance", tags=["attendance"])


def get_class_or_404(class_id: int, user: User, db: Session) -> Class:
    class_ = db.query(Class).filter(Class.id == class_id, Class.teacher_id == user.id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_


@router.post("/", response_model=list[AttendanceOut])
def save_attendance(class_id: int, data: AttendanceBulk, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    db.query(Attendance).filter(Attendance.class_id == class_id, Attendance.date == data.date).delete()
    records = [
        Attendance(student_id=e.student_id, class_id=class_id, date=data.date, status=e.status)
        for e in data.entries
    ]
    db.add_all(records)
    db.commit()
    return records


@router.get("/", response_model=list[AttendanceOut])
def get_attendance(class_id: int, date: date, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    return db.query(Attendance).filter(Attendance.class_id == class_id, Attendance.date == date).all()


@router.get("/stats")
def attendance_stats(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_class_or_404(class_id, user, db)
    students = db.query(Student).filter(Student.class_id == class_id).all()
    stats = []
    for student in students:
        total = db.query(func.count(Attendance.id)).filter(Attendance.student_id == student.id).scalar()
        present = db.query(func.count(Attendance.id)).filter(
            Attendance.student_id == student.id,
            Attendance.status.in_(["present", "late"])
        ).scalar()
        rate = round((present / total * 100) if total > 0 else 100, 1)
        stats.append({
            "student_id": student.id,
            "name": f"{student.first_name} {student.last_name}",
            "attendance_rate": rate,
            "at_risk": rate < 80,
        })
    return stats
