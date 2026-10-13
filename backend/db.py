from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()


def build_engine(database_url: str):
    engine_kwargs = {}
    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    elif database_url.startswith("postgresql"):
        engine_kwargs["connect_args"] = {"sslmode": "require"}
        engine_kwargs["pool_pre_ping"] = True
    return create_engine(database_url, **engine_kwargs)


database_url = os.environ.get("URL_DATABASE")
if not database_url:
    database_url = "sqlite:///./database.db"

engine = build_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
