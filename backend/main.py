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
    courses = db.query(Courses).order_by(Courses.id).all()
    check_404(courses, "courses")
    return courses


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
async def get_all_deadlines(db: db_dependency):
    dls = db.query(Deadlines).order_by(Deadlines.id).all()
    check_404(dls, "deadlines")
    courses = db.query(Courses).all()
    check_404(courses, "courses")

    form_courses = {}
    for c in courses:
        form_courses[c.id] = c.name

    form = []
    for d in dls:
        dict = {
            "id": d.id,
            "course": form_courses[d.course],
            "name": d.name,
            "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
        }
        form.append(dict)

    return form


@app.get("/deadlines/{course_id}")
async def get_deadlines(course_id: int, db: db_dependency):
    dls = (
        db.query(Deadlines)
        .order_by(Deadlines.id)
        .filter(Deadlines.course == course_id)
        .all()
    )
    check_404(dls, "deadlines")

    form = []
    for d in dls:
        form.append(
            {
                "id": d.id,
                "name": d.name,
                "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
            }
        )

    return form


@app.put("/deadlines/{dl_id}")
async def update_deadline(dl_id: int, new: DeadlineBase, db: db_dependency):
    prev = db.query(Deadlines).filter(Deadlines.id == dl_id).first()
    check_404(prev, "deadline")

    for key, value in new.model_dump().items():
        setattr(prev, key, value)

    db.commit()


@app.delete("/deadlines/{dl_id}")
async def delete_deadlines(dl_id: int, db: db_dependency):
    db.query(Deadlines).filter(Deadlines.id == dl_id).delete()
    db.commit()


############
# TASKS
############


@app.post("/tasks/")
async def add_task(task: TaskBase, db: db_dependency):
    db_task = Tasks(course=task.course, deadline=task.deadline, todo=task.todo)
    db.add(db_task)
    db.commit()


@app.get("/tasks/")
async def get_all_tasks(db: db_dependency):
    tasks = db.query(Tasks).order_by(Tasks.id).all()
    check_404(tasks, "tasks")
    dls = db.query(Deadlines).all()
    check_404(dls, "deadlines")
    courses = db.query(Courses).all()
    check_404(courses, "courses")

    form_dls = {}
    for d in dls:
        form_dls[d.id] = d.name

    form_courses = {}
    for c in courses:
        form_courses[c.id] = c.name

    form = {}
    for t in tasks:
        form.append(
            {
                "id": t.id,
                "course": form_courses[t.course],
                "deadline": form_dls[t.deadline],
                "todo": t.todo,
            }
        )

    return form


@app.get("/tasks/{course_id}/{dl_id}")
async def get_tasks(course_id: int, dl_id: int, db: db_dependency):
    tasks = (
        db.query(Tasks)
        .order_by(Tasks.id)
        .filter(Tasks.course == course_id, Tasks.deadline == dl_id)
        .all()
    )
    check_404(tasks, "tasks")
    dls = (
        db.query(Deadlines)
        .filter(Deadlines.course == course_id, Deadlines.id == dl_id)
        .all()
    )
    check_404(dls, "deadlines")
    courses = db.query(Courses).filter(Courses.id == course_id).all()
    check_404(courses, "courses")
