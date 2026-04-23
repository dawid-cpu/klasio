from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # present, absent, late
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("idx_attendance_student_date", "student_id", "date"),)

    student = relationship("Student", back_populates="attendances")
    class_ = relationship("Class", back_populates="attendances")
