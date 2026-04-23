from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    student_number = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("student_number", "class_id", name="uq_student_number_per_class"),)

    class_ = relationship("Class", back_populates="students")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")
