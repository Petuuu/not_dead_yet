from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Boolean
from db import Base


class Trackers(Base):
    __tablename__ = "trackers"

    id = Column(Integer, primary_key=True)
    value = Column(String, unique=True)


class Courses(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    tracker = Column(String, ForeignKey("trackers.value", ondelete="CASCADE"))
    name = Column(String)
    credits = Column(Integer)


class Deadlines(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    tracker = Column(String, ForeignKey("trackers.value", ondelete="CASCADE"))
    course = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    name = Column(String)
    due = Column(DateTime)


class Tasks(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    tracker = Column(String, ForeignKey("trackers.value", ondelete="CASCADE"))
    course = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    deadline = Column(Integer, ForeignKey("deadlines.id", ondelete="CASCADE"))
    todo = Column(String)
    checked = Column(Boolean, default=False)
