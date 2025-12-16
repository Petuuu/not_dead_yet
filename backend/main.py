from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated
from sqlalchemy.orm import Session
from db import engine, SessionLocal
import models
import datetime

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"]
)


class CourseBase(BaseModel):
    name: str


class DeadlineBase(BaseModel):
    course: int
    name: str
    due: datetime.datetime


class TaskBase(BaseModel):
    course: int
    deadline: int
    todo: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


@app.post("/courses/")
async def add_course(course: CourseBase, db: db_dependency):
    db_course = models.Courses(name=course.name)
    db.add(db_course)
    db.commit()
