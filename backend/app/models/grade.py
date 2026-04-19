from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class GradeCategory(Base):
    __tablename__ = "grade_categories"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    weight = Column(Float, nullable=False, default=1.0)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    grades = relationship("Grade", back_populates="category", cascade="all, delete-orphan")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True)
    value = Column(Float, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("grade_categories.id"), nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="grades")
    class_ = relationship("Class", back_populates="grades")
    category = relationship("GradeCategory", back_populates="grades")
