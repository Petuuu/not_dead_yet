"""Utility script to drop and recreate all tables."""

from db import Base, engine
import models

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database recreated successfully!")
