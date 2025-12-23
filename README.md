# Overview

**Not Dead Yet** is an easy-to-use web application that helps students track study-related deadlines. Users can add courses, manage their associated deadlines, and organize related tasks.

## Local Use

To run **Not Dead Yet** locally, you need to setup a `PostgreSQL` (or with some modifications an `SQLite`) database and start the `FastAPI` backend and `React` frontend servers.

Before doing so, however, you need to install the required dependencies using:

```bash
pip install -r backend/requirements.txt
```


### Database

Create a database and add its URL to `.env` file in the `backend` directory in the following form:

PostgreSQL:

```python
URL_DATABASE="postgresql://user:password@localhost:port/database"
```

SQLite:

```python
URL_DATABASE="sqlite:///./database.db"
```


### Backend

To start the backend server, you need to navigate to the `backend` directory:

```bash
cd backend/
```

Then launch the application using:

```bash
uvicorn main:app --reload
```

Once running, the backend will be available at `http://localhost:8000`. The FastAPI interactive documentation for the backend endpoints and schemas can be accessed at `http://localhost:8000/docs`.


### Frontend

To start the frontend development server, you need to navigate to the `frontend` directory:

```bash
cd frontend/
```

Then launch the application using:

```bash
npm start
```

The frontend will be available at `http://localhost:3000`.
