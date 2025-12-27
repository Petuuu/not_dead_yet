from fastapi import FastAPI, status, Response, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import Annotated
from secrets import token_urlsafe
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from time import time
from dotenv import load_dotenv
import os
from db import engine, SessionLocal
from models import Base, Courses, Deadlines, Tasks, Trackers

load_dotenv()
Base.metadata.create_all(bind=engine)


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time()
        response = await call_next(request)
        process_time = time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        print(f"{request.method} {request.url.path} completed in {process_time:.4f}s")
        return response


origins = [
    "http://localhost:3000",
    "https://not-dead-yet.vercel.app",
]

app = FastAPI(docs_url=os.environ.get("URL_DOCS"))
app.add_middleware(TimingMiddleware)
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"]
)


TRACKER_COOLDOWN_SECONDS = 10
_last_tracker_creation: dict[str, float] = {}


class TrackerBase(BaseModel):
    value: str


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


class UpdateDlName(BaseModel):
    name: str


class UpdateDlDue(BaseModel):
    day: int
    month: int
    year: int


class UpdateChecked(BaseModel):
    checked: bool


class UpdateTodo(BaseModel):
    todo: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


############
# TRACKERS
############


def _client_key(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


@app.post("/trackers/")
async def create_tracker(request: Request, db: db_dependency):
    client_key = _client_key(request)
    print(client_key)
    now = time()
    last_created = _last_tracker_creation.get(client_key, 0)
    elapsed = now - last_created

    if elapsed < TRACKER_COOLDOWN_SECONDS:
        retry_after = int(TRACKER_COOLDOWN_SECONDS - elapsed + 0.999)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Tracker creation is limited to one every 10 seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    value = token_urlsafe(32)
    tracker = Trackers(value=value)
    db.add(tracker)
    db.commit()
    db.refresh(tracker)

    _last_tracker_creation[client_key] = now

    return {"id": tracker.id, "value": tracker.value}


@app.get("/trackers/")
async def get_trackers(db: db_dependency):
    return db.query(Trackers).order_by(Trackers.id).all() or "No trackers found"


@app.get("/trackers/{tracker}")
async def get_tracker(tracker: str, db: db_dependency):
    tracker = db.query(Trackers).filter(Trackers.value == tracker).first()
    if tracker is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return tracker.id or "No tracker found"


@app.delete("/trackers/{tracker}")
async def delete_tracker(tracker: str, db: db_dependency):
    db.query(Trackers).filter(Trackers.value == tracker).delete()
    db.commit()


############
# COURSES
############


@app.post("/courses/")
async def add_course(tracker: str, course: CourseBase, db: db_dependency):
    db_course = Courses(tracker=tracker, name=course.name, credits=course.credits)
    db.add(db_course)
    db.commit()


@app.get("/courses/")
async def get_courses(db: db_dependency):
    courses = db.query(Courses).order_by(Courses.tracker, Courses.id).all()

    return [
        {
            "id": c.id,
            "tracker": c.tracker,
            "name": c.name,
            "credits": c.credits,
        }
        for c in courses
    ] or "No courses found"


@app.get("/courses/{tracker}")
async def get_tracker_courses(tracker: str, db: db_dependency):
    courses = (
        db.query(Courses).filter(Courses.tracker == tracker).order_by(Courses.id).all()
    )

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
    prev.name = new.name
    prev.credits = new.credits

    db.commit()


@app.delete("/courses/{course_id}")
async def delete_course(course_id: int, db: db_dependency):
    db.query(Courses).filter(Courses.id == course_id).delete()
    db.commit()


############
# DEADLINES
############


@app.post("/deadlines/")
async def add_deadline(tracker: str, dl: DeadlineBase, db: db_dependency):
    deadline = Deadlines(tracker=tracker, course=dl.course, name=dl.name, due=dl.due)
    db.add(deadline)
    db.commit()


@app.post("/deadlines/{dl_id}")
async def duplicate_deadline(dl_id: int, db: db_dependency):
    dl = (
        db.query(Deadlines.tracker, Deadlines.course, Deadlines.name, Deadlines.due)
        .filter(Deadlines.id == dl_id)
        .first()
    )

    if not dl:
        return "No deadline found"

    tasks = db.query(Tasks.todo).filter(Tasks.deadline == dl_id).all()

    new_name = ""
    as_int = 0
    times = 1
    for c in dl.name:
        if c.isdigit():
            as_int *= times
            as_int += int(c)
            times *= 10
        else:
            new_name += c

    if as_int == 0:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    new_name += str(as_int + 1)
    new_due = dl.due + timedelta(days=7)

    new_dl = Deadlines(tracker=dl.tracker, course=dl.course, name=new_name, due=new_due)
    db.add(new_dl)
    db.commit()
    db.refresh(new_dl)

    for t in tasks:
        await add_task(
            dl.tracker, Tasks(course=dl.course, deadline=new_dl.id, todo=t.todo), db
        )


@app.get("/deadlines/")
async def get_all_deadlines(db: db_dependency):
    dls = (
        db.query(
            Deadlines.id,
            Deadlines.tracker,
            Courses.name.label("course"),
            Deadlines.name,
            Deadlines.due,
        )
        .join(Courses, Deadlines.course == Courses.id)
        .order_by(Deadlines.tracker, Courses.id, Deadlines.due, Deadlines.id)
        .all()
    )

    return [
        {
            "id": d.id,
            "tracker": d.tracker,
            "course": d.course,
            "name": d.name,
            "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
        }
        for d in dls
    ] or "No deadlines found"


@app.get("/deadlines/{tracker}")
async def get_all_deadlines(tracker: str, db: db_dependency):
    dls = (
        db.query(
            Deadlines.id,
            Courses.name.label("course"),
            Deadlines.name,
            Deadlines.due,
        )
        .join(Courses, Deadlines.course == Courses.id)
        .filter(Deadlines.tracker == tracker)
        .order_by(Courses.id, Deadlines.due, Deadlines.id)
        .all()
    )

    return [
        {
            "id": d.id,
            "tracker": d.tracker,
            "course": d.course,
            "name": d.name,
            "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
        }
        for d in dls
    ] or "No deadlines found"


@app.get("/deadlines/{tracker}/{course_id}")
async def get_deadlines(tracker: str, course_id: int, db: db_dependency):
    dls = (
        db.query(Deadlines.id, Deadlines.name, Deadlines.due)
        .filter(Deadlines.tracker == tracker, Deadlines.course == course_id)
        .order_by(Deadlines.due, Deadlines.id)
        .all()
    )

    return [
        {
            "id": d.id,
            "name": d.name,
            "due": f"{d.due.day}/{d.due.month}/{d.due.year}",
            "dlDue": [d.due.day, d.due.month, d.due.year],
        }
        for d in dls
    ] or "No deadlines found"


@app.put("/deadlines/{dl_id}/name")
async def update_dl_name(dl_id: int, update: UpdateDlName, db: db_dependency):
    prev = db.query(Deadlines).filter(Deadlines.id == dl_id).first()
    prev.name = update.name
    db.commit()


@app.put("/deadlines/{dl_id}/due")
async def update_dl_due(dl_id: int, update: UpdateDlDue, db: db_dependency):
    prev = db.query(Deadlines).filter(Deadlines.id == dl_id).first()
    prev.due = datetime(update.year, update.month, update.day)
    db.commit()


@app.delete("/deadlines/{dl_id}")
async def delete_deadlines(dl_id: int, db: db_dependency):
    db.query(Deadlines).filter(Deadlines.id == dl_id).delete()
    db.commit()


############
# TASKS
############


@app.post("/tasks/")
async def add_task(tracker: str, task: TaskBase, db: db_dependency):
    db_task = Tasks(
        tracker=tracker,
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
            Tasks.tracker,
            Courses.name.label("course"),
            Deadlines.name.label("deadline"),
            Deadlines.due.label("dlDue"),
            Tasks.todo,
            Tasks.checked,
        )
        .join(Courses, Tasks.course == Courses.id)
        .join(Deadlines, Tasks.deadline == Deadlines.id)
        .order_by(Tasks.tracker, Courses.id, Deadlines.due, Deadlines.id, Tasks.id)
        .all()
    )

    return [
        {
            "id": t.id,
            "tracker": t.tracker,
            "course": t.course,
            "deadline": t.deadline,
            "dlDue": [t.dlDue.day, t.dlDue.month, t.dlDue.year],
            "todo": t.todo,
            "checked": t.checked,
        }
        for t in tasks
    ] or "No tasks found"


@app.get("/tasks/{tracker}")
async def get_all_tasks(tracker: str, db: db_dependency):
    tasks = (
        db.query(
            Tasks.id,
            Courses.name.label("course"),
            Deadlines.name.label("deadline"),
            Deadlines.due.label("dlDue"),
            Tasks.todo,
            Tasks.checked,
        )
        .join(Courses, Tasks.course == Courses.id)
        .join(Deadlines, Tasks.deadline == Deadlines.id)
        .filter(Tasks.tracker == tracker)
        .order_by(Courses.id, Deadlines.due, Deadlines.id, Tasks.id)
        .all()
    )

    return [
        {
            "id": t.id,
            "course": t.course,
            "deadline": t.deadline,
            "dlDue": [t.dlDue.day, t.dlDue.month, t.dlDue.year],
            "todo": t.todo,
            "checked": t.checked,
        }
        for t in tasks
    ] or "No tasks found"


@app.get("/tasks/{tracker}/{course_id}")
async def get_course_tasks(tracker: str, course_id: int, db: db_dependency):
    tasks = (
        db.query(
            Tasks.id,
            Deadlines.name.label("deadline"),
            Deadlines.due.label("dlDue"),
            Tasks.todo,
            Tasks.checked,
        )
        .join(Deadlines, Tasks.deadline == Deadlines.id)
        .filter(Tasks.tracker == tracker, Tasks.course == course_id)
        .order_by(Deadlines.due, Deadlines.id, Tasks.id)
        .all()
    )

    return [
        {
            "id": t.id,
            "deadline": t.deadline,
            "dlDue": [t.dlDue.day, t.dlDue.month, t.dlDue.year],
            "todo": t.todo,
            "checked": t.checked,
        }
        for t in tasks
    ] or "No tasks found"


@app.get("/tasks/{tracker}/{course_id}/{dl_id}")
async def get_tasks(tracker: str, course_id: int, dl_id: int, db: db_dependency):
    tasks = (
        db.query(Tasks.id, Tasks.todo, Tasks.checked)
        .filter(
            Tasks.tracker == tracker, Tasks.course == course_id, Tasks.deadline == dl_id
        )
        .order_by(Tasks.id)
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


@app.put("/tasks/{task_id}/checked")
async def update_checked(task_id: int, update: UpdateChecked, db: db_dependency):
    prev = db.query(Tasks).filter(Tasks.id == task_id).first()
    prev.checked = update.checked
    db.commit()


@app.put("/tasks/{task_id}/todo")
async def update_todo(task_id: int, update: UpdateTodo, db: db_dependency):
    prev = db.query(Tasks).filter(Tasks.id == task_id).first()
    prev.todo = update.todo
    db.commit()


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: db_dependency):
    db.query(Tasks).filter(Tasks.id == task_id).delete()
    db.commit()
