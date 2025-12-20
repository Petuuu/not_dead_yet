from db import engine, Base
from models import Courses, Deadlines, Tasks

# Drop all tables
Base.metadata.drop_all(bind=engine)

# Recreate all tables
Base.metadata.create_all(bind=engine)

print("Database recreated successfully!")
