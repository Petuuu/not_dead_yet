import { useState, useEffect } from "react";
import api from "../api";
import CourseCard from "./CourseCard";
import CourseForm from "./forms/CourseForm";
import DeadlineForm from "./forms/DeadlineForm";
import EditCard from "./EditCard"
import TaskForm from "./forms/TaskForm";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [edit, setEdit] = useState({});


    async function fetchAll() {
        try {
            const res = await api.get("/courses/");
            setCourses(res.data);

            for (const course of res.data) {
                try {
                    const dlsRes = await api.get(`/deadlines/${course.id}`);
                    setDeadlines(prev => ({ ...prev, [course.id]: dlsRes.data }));
                }
                catch (e) {
                    console.error(`Error fetching deadlines for course ${course.id}:`, e);
                    setDeadlines(prev => ({ ...prev, [course.id]: [] }));
                }

                try {
                    const tasksRes = await api.get(`/tasks/${course.id}`);
                    setTasks(prev => ({ ...prev, [course.id]: tasksRes.data }));
                }
                catch (e) {
                    console.error(`Error fetching tasks for course ${course.id}:`, e);
                    setTasks(prev => ({ ...prev, [course.id]: [] }));
                }

                setEdit(prev => ({ ...prev, [course.id]: false }))
            }
        }
        catch (e) {
            console.error("Error fetching courses:", e);
        }
    };

    async function addCourse(courseName, credits) {
        try {
            await api.post("/courses/", { name: courseName, credits: credits });
            await fetchAll();
        }
        catch (e) {
            console.error("Error adding course:", e)
        }
    };


    async function addDeadline(courseId, name, due_date) {
        try {
            await api.post("/deadlines/", { course: courseId, name: name, due: due_date });
            await fetchAll();
        }
        catch (e) {
            console.error("Error adding deadline:", e);
        }
    };

    async function addTask(courseId, deadlineId, todo) {
        try {
            await api.post("/tasks/", { course: courseId, deadline: deadlineId, todo: todo });
            await fetchAll();
        }
        catch (e) {
            console.error("Error adding task:", e)
        }
    };

    async function updateCourse(courseId, name, credits) {
        try {
            console.log(name);
            await api.put(`/courses/${courseId}`, { name: name, credits: credits });
        }
        catch (e) {
            console.error(`Error updating course ${courseId}:`, e);
        }
    }

    async function updateDeadline(deadlineId, name, due) {
        try {
            await api.put(`/deadlines/${deadlineId}`, { name: name, due: due });
        }
        catch (e) {
            console.error(`Error updating deadline ${deadlineId}:`, e);
        }
    }

    async function updateChecked(taskId, checked) {
        try {
            await api.put(`/tasks/${taskId}/checked`, { checked: checked });
            await fetchAll();
        }
        catch (e) {
            console.error(`Error updating task ${taskId}:`, e);
        }
    }

    async function updateTodo(taskId, todo) {
        try {
            await api.put(`/tasks/${taskId}/todo`, { todo: todo });
        }
        catch (e) {
            console.error(`Error updating task ${taskId}:`, e);
        }
    }

    useEffect(() => {
        fetchAll();
    }, []);

    return (
        <>
            <div className="grid grid-cols-4 gap-y-[4vw] items-start m-[5vw]">
                {courses.map(course => {
                    if (edit[course.id]) {
                        return (
                            <EditCard
                            key={course.id}
                            course={course}
                            deadlines={Array.isArray(deadlines[course.id]) ? deadlines[course.id] : []}
                            tasks={Array.isArray(tasks[course.id]) ? tasks[course.id] : []}
                            setEdit={setEdit}
                            updateCourse={updateCourse}
                            updateDeadline={updateDeadline}
                            updateTodo={updateTodo}
                            fetchAll={fetchAll}
                            />
                        );
                    }

                    return (
                        <CourseCard
                        key={course.id}
                        course={course}
                        deadlines={Array.isArray(deadlines[course.id]) ? deadlines[course.id] : []}
                        tasks={Array.isArray(tasks[course.id]) ? tasks[course.id] : []}
                        updateChecked={updateChecked}
                        setEdit={setEdit}
                        />
                    );
                })}
            </div>

            <div className="flex flex-wrap">
                <CourseForm addCourse={addCourse} />
                <DeadlineForm addDeadline={addDeadline} courses={courses} />
                <TaskForm addTask={addTask} courses={courses} deadlines={deadlines} />
            </div>
        </>
    );
}