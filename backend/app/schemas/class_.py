from pydantic import BaseModel


class ClassCreate(BaseModel):
    name: str
    subject: str


class ClassOut(BaseModel):
    id: int
    name: str
    subject: str
    student_count: int = 0

    model_config = {"from_attributes": True}
