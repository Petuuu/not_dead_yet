from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from db import Base


class Users(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True)
    uname = Column(String, unique=True)
    password = Column(String)


class Courses(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    credits = Column(Integer)


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
