from pydantic import BaseModel, Field
from typing import Optional


class GradeCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    weight: float = Field(..., gt=0)


class GradeCategoryOut(BaseModel):
    id: int
    name: str
    weight: float

    model_config = {"from_attributes": True}


class GradeCreate(BaseModel):
    value: float = Field(..., ge=1.0, le=6.0)
    student_id: int
    category_id: int
    description: Optional[str] = None


class GradeOut(BaseModel):
    id: int
    value: float
    student_id: int
    category_id: int
    description: Optional[str]

    model_config = {"from_attributes": True}
