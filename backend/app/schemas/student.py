from pydantic import BaseModel


class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    student_number: int


class StudentOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    student_number: int
    class_id: int

    model_config = {"from_attributes": True}
