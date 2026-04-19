from pydantic import BaseModel
from datetime import date
from typing import Literal


class AttendanceEntry(BaseModel):
    student_id: int
    status: Literal["present", "absent", "late"]


class AttendanceBulk(BaseModel):
    date: date
    entries: list[AttendanceEntry]


class AttendanceOut(BaseModel):
    student_id: int
    status: str
    date: date

    model_config = {"from_attributes": True}
