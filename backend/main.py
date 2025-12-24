from fastapi import FastAPI, Depends
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
    checked: bool = False


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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

    return [
        {
            "id": c.id,
            "name": c.name,
            "credits": c.credits,
        }
        for c in courses
    ] or "No courses found"


@app.put("/courses/{course_id}")
async def update_course(course_id: int, new: CourseBase, db: db_dependency):
    prev = db.query(Courses).filter(Courses.id == course_id).first()

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
    dls = (
        db.query(
            Deadlines.id, Courses.name.label("course"), Deadlines.name, Deadlines.due
        )
        .join(Courses, Deadlines.course == Courses.id)
        .order_by(Courses.id, Deadlines.id)
        .all()
    )

    return [
        {
            "id": d.id,
            "course": d.course,
            "name": d.name,
            "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
        }
        for d in dls
    ] or "No deadlines found"


@app.get("/deadlines/{course_id}")
async def get_deadlines(course_id: int, db: db_dependency):
    dls = (
        db.query(Deadlines)
        .order_by(Deadlines.id)
        .filter(Deadlines.course == course_id)
        .all()
    )

    return [
        {
            "id": d.id,
            "name": d.name,
            "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
        }
        for d in dls
    ] or "No deadlines found"


@app.put("/deadlines/{dl_id}")
async def update_deadline(dl_id: int, new: DeadlineBase, db: db_dependency):
    prev = db.query(Deadlines).filter(Deadlines.id == dl_id).first()

    for key, value in new.model_dump().items():
        if key != "course":
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
    db_task = Tasks(
        course=task.course,
        deadline=task.deadline,
        todo=task.todo,
        checked=task.checked,
    )
    db.add(db_task)
    db.commit()


@app.get("/tasks/")
async def get_all_tasks(db: db_dependency):
    tasks = (
        db.query(
            Tasks.id,
            Courses.name.label("course"),
            Deadlines.name.label("deadline"),
            Tasks.todo,
            Tasks.checked,
        )
        .join(Courses, Tasks.course == Courses.id)
        .join(Deadlines, Tasks.deadline == Deadlines.id)
        .all()
    )

    return [
        {
            "id": t.id,
            "course": t.course,
            "deadline": t.deadline,
            "todo": t.todo,
            "checked": t.checked,
        }
        for t in tasks
    ] or "No tasks found"


@app.get("/tasks/{course_id}")
async def get_course_tasks(course_id: int, db: db_dependency):
    tasks = (
        db.query(
            Tasks.id,
            Deadlines.name.label("deadline"),
            Tasks.todo,
            Tasks.checked,
        )
        .join(Deadlines, Tasks.deadline == Deadlines.id)
        .filter(Tasks.course == course_id)
        .all()
    )

    return [
        {
            "id": t.id,
            "deadline": t.deadline,
            "todo": t.todo,
            "checked": t.checked,
        }
        for t in tasks
    ] or "No tasks found"


@app.get("/tasks/{course_id}/{dl_id}")
async def get_tasks(course_id: int, dl_id: int, db: db_dependency):
    tasks = (
        db.query(Tasks.id, Tasks.todo, Tasks.checked)
        .filter(Tasks.course == course_id, Tasks.deadline == dl_id)
        .all()
    )

    return [
        {
            "id": t.id,
            "todo": t.todo,
            "checked": t.checked,
        }
        for t in tasks
    ] or "No tasks found"


@app.put("/tasks/{task_id}")
async def update_checked(task_id: int, checked: bool, db: db_dependency):
    prev = db.query(Tasks).filter(Tasks.id == task_id).first()
    prev.checked = checked
    db.commit()


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: db_dependency):
    db.query(Tasks).filter(Tasks.id == task_id).delete()
    db.commit()
