from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DB_URL = "postgresql://postgres:password@localhost:5432/Main"

engine = create_engine(DB_URL)
