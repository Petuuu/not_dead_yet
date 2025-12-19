from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from db import Base


class Courses(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)


class Deadlines(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    course = Column(Integer, ForeignKey("courses.id"))
    name = Column(String)
    due = Column(DateTime)


class Tasks(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    course = Column(Integer, ForeignKey("courses.id"))
    deadline = Column(Integer, ForeignKey("deadlines.id"))
    todo = Column(String)
