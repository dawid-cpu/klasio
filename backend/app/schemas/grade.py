from pydantic import BaseModel
from typing import Optional


class GradeCategoryCreate(BaseModel):
    name: str
    weight: float


class GradeCategoryOut(BaseModel):
    id: int
    name: str
    weight: float

    model_config = {"from_attributes": True}


class GradeCreate(BaseModel):
    value: float
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
