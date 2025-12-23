import { useState, useEffect } from "react";
import api from "../api";
import CourseCard from "./CourseCard";
import CourseForm from "./forms/CourseForm";
import DeadlineForm from "./forms/DeadlineForm";
import TaskForm from "./forms/TaskForm";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [tasks, setTasks] = useState([]);


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
            }
        }
        catch (e) {
            console.error("Error fetching courses:", e);
        }
    };

    async function addCourse(courseName, credits) {
        try {
            await api.post("/courses/", { name: courseName, credits: credits });
            fetchAll();
        }
        catch (e) {
            console.error("Error adding course:", e)
        }
    };


    async function addDeadline(courseId, name, due_date) {
        try {
            await api.post("/deadlines/", { course: courseId, name: name, due: due_date });
            fetchAll();
        }
        catch (e) {
            console.error("Error adding deadline:", e);
        }
    };

    async function addTask(courseId, deadlineId, todo) {
        // code
    };

    useEffect(() => {
        fetchAll();
    }, []);

    console.log(tasks[2])

    return (
        <>
            <div className="grid grid-cols-4 gap-y-[4vw] items-start m-[5vw]">
                {courses.map(course => (
                    <CourseCard course={course} deadlines={deadlines[course.id] || []} tasks={tasks[course.id] || []} />
                ))}
            </div>

            <div>
                <CourseForm addCourse={addCourse} />
                <DeadlineForm addDeadline={addDeadline} courses={courses} />
                <TaskForm addTask={addTask} courses={courses} deadlines={deadlines} />
            </div>
        </>
    );
}