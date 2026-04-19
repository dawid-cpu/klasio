from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher = relationship("User", back_populates="classes")
    students = relationship("Student", back_populates="class_", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="class_", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="class_", cascade="all, delete-orphan")
