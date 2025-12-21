from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated
from sqlalchemy.orm import Session
from db import engine, SessionLocal
from models import Base, Courses, Deadlines, Tasks
from datetime import datetime

app = FastAPI()
Base.metadata.create_all(bind=engine)

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"]
)


class Users(BaseModel):
    uname: str
    password: str


class CourseBase(BaseModel):
    name: str
    credits: int


class DeadlineBase(BaseModel):
    course: int
    name: str
    due: datetime


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


def check_404(to_check, item: str):
    if not to_check:
        raise HTTPException(status_code=404, detail=f"No {item} found")


db_dependency = Annotated[Session, Depends(get_db)]


############
# COURSES
############


@app.post("/courses/")
async def add_course(course: CourseBase, db: db_dependency):
    db_course = Courses(name=course.name, credits=course.credits)
    db.add(db_course)
    db.commit()


@app.get("/courses/")
async def get_courses(db: db_dependency):
    result = db.query(Courses).all()
    check_404(result, "courses")
    return result


@app.put("/courses/{course_id}")
async def update_course(course_id: int, new: CourseBase, db: db_dependency):
    prev = db.query(Courses).filter(Courses.id == course_id).first()
    check_404(prev, "course")

    for key, value in new.model_dump().items():
        setattr(prev, key, value)

    db.commit()


@app.delete("/courses/{course_id}")
async def delete_course(course_id: int, db: db_dependency):
    db.query(Courses).filter(Courses.id == course_id).delete()
    db.commit()


############
# DEADLINES
############


@app.post("/deadlines/")
async def add_deadline(dl: DeadlineBase, db: db_dependency):
    db_deadline = Deadlines(course=dl.course, name=dl.name, due=dl.due)
    db.add(db_deadline)
    db.commit()


@app.get("/deadlines/")
async def get_deadlines(db: db_dependency):
    result = db.query(Deadlines).all()
    check_404(result, "deadlines")

    form = []
    for r in result:
        dict = {
            "name": r.name,
            "due": f"{r.due.day}/{r.due.month}/{r.due.year}",
            "id": r.id,
            "course": r.course,
        }
        form.append(dict)

    return form


@app.get("/deadlines/{course_id}")
async def get_deadlines(course_id: int, db: db_dependency):
    result = db.query(Deadlines).filter(Deadlines.course == course_id).all()
    check_404(result, "deadlines")

    form = []
    for r in result:
        dict = {
            "name": r.name,
            "due": f"{r.due.day}/{r.due.month}/{r.due.year}",
            "id": r.id,
        }
        form.append(dict)

    return form


############
# TASKS
############


@app.post("/tasks/")
async def add_task(course_id: int, deadline_id: int, task: TaskBase, db: db_dependency):
    pass


@app.get("/tasks/{course_id}/{deadline_id}")
async def get_tasks(course_id: int, deadline_id: int, db: db_dependency):
    pass
