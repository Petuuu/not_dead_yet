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
    const [slide, setSlide] = useState({});
    const [edit, setEdit] = useState({});

    async function fetchAll() {
        try {
            const res = await api.get("/courses/");
            const coursesData = Array.isArray(res.data) ? res.data : [];
            setCourses(coursesData);

            for (const c of coursesData) {
                try {
                    const dlsRes = await api.get(`/deadlines/${c.id}`);
                    setDeadlines(prev => ({ ...prev, [c.id]: Array.isArray(dlsRes.data) ? dlsRes.data : [] }));
                }
                catch (e) {
                    console.error(`Error fetching deadlines for course ${c.id}:`, e);
                    setDeadlines(prev => ({ ...prev, [c.id]: [] }));
                }

                try {
                    const tasksRes = await api.get(`/tasks/${c.id}`);
                    setTasks(prev => ({ ...prev, [c.id]: Array.isArray(tasksRes.data) ? tasksRes.data : [] }));
                }
                catch (e) {
                    console.error(`Error fetching tasks for course ${c.id}:`, e);
                    setTasks(prev => ({ ...prev, [c.id]: [] }));
                }
            }
        }
        catch (e) {
            console.error("Error fetching courses:", e);
            setCourses([]);
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

    async function duplicateDl(deadlineId) {
        try {
            await api.post(`/deadlines/${deadlineId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error duplicating deadline ${deadlineId}`);
        }
    }

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
            await api.put(`/courses/${courseId}`, { name: name, credits: credits });
        }
        catch (e) {
            console.error(`Error updating course ${courseId}:`, e);
        }
    }

    async function updateDlName(deadlineId, name) {
        try {
            await api.put(`/deadlines/${deadlineId}/name`, { name: name });
        }
        catch (e) {
            console.error(`Error updating deadline ${deadlineId}:`, e);
        }
    }

    async function updateDlDue(deadlineId, due) {
        try {
            await api.put(`/deadlines/${deadlineId}/due`, { due: new Date(due[2], due[1] - 1, due[0]) });
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

    async function deleteCourse(courseId) {
        try {
            await api.delete(`/courses/${courseId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error deleting course ${courseId}:`, e);
        }
    }

    async function deleteDeadline(deadlineId) {
        try {
            await api.delete(`/deadlines/${deadlineId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error deleting deadline ${deadlineId}:`, e);
        }
    }

    async function deleteTask(taskId) {
        try {
            await api.delete(`/tasks/${taskId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error deleting task ${taskId}:`, e);
        }
    }

    async function load() {
        try {
            const res = await api.get("/courses/");
            setCourses(res.data);
            res.data.forEach(c => setEdit(prev => ({ ...prev, [c.id]: false })));
            res.data.forEach(c => setSlide(prev => ({ ...prev, [c.id]: 0 })));
        } catch (e) {
            console.error("Error loading courses:", e);
            setCourses([]);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            <div className="grid grid-cols-4 gap-y-[4vw] items-start m-[5vw]">
                {courses.map(c => {
                    if (edit[c.id]) {
                        return (
                            <EditCard
                                key={c.id}
                                course={c}
                                deadlines={Array.isArray(deadlines[c.id]) ? deadlines[c.id] : []}
                                tasks={Array.isArray(tasks[c.id]) ? tasks[c.id] : []}
                                slide={typeof slide[c.id] === "number" ? slide[c.id] : 0}
                                setSlide={(newSlide) => setSlide(prev => ({ ...prev, [c.id]: newSlide }))}
                                setEdit={setEdit}
                                duplicateDl={duplicateDl}
                                updateCourse={updateCourse}
                                updateDlName={updateDlName}
                                updateDlDue={updateDlDue}
                                updateTodo={updateTodo}
                                deleteCourse={deleteCourse}
                                deleteDeadline={deleteDeadline}
                                deleteTask={deleteTask}
                                fetchAll={fetchAll}
                            />
                        );
                    }

                    return (
                        <CourseCard
                            key={c.id}
                            course={c}
                            deadlines={Array.isArray(deadlines[c.id]) ? deadlines[c.id] : []}
                            tasks={Array.isArray(tasks[c.id]) ? tasks[c.id] : []}
                            slide={typeof slide[c.id] === "number" ? slide[c.id] : 0}
                            setSlide={(newSlide) => setSlide(prev => ({ ...prev, [c.id]: newSlide }))}
                            updateChecked={updateChecked}
                            setEdit={setEdit}
                        />
                    );
                })}
            </div>

            <div className="bg-slate-300 bg-opacity-70 flex flex-wrap mx-[5vw] mb-[3vw] rounded-xl">
                <CourseForm addCourse={addCourse} />
                <DeadlineForm addDeadline={addDeadline} courses={courses} />
                <TaskForm addTask={addTask} courses={courses} deadlines={deadlines} />
            </div>
        </>
    );
}