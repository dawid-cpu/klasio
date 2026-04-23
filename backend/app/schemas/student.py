from pydantic import BaseModel, Field
from typing import Optional


class StudentCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    student_number: int = Field(..., gt=0)
    notes: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    student_number: int
    notes: Optional[str]
    class_id: int

    model_config = {"from_attributes": True}
