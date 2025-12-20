import { useState, useEffect } from "react";
import api from "../api";
import CourseCard from "./CourseCard";
import CourseForm from "./CourseForm";
import DeadlineForm from "./DeadlineForm";
import TaskForm from "./TaskForm";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [deadlines, setDeadlines] = useState([]);


    async function fetchCourses() {
        try {
            const res = await api.get("/courses/");
            setCourses(res.data);
        }
        catch (e) {
            console.error("Error fetching courses:", e);
        }
    }

    async function addCourse(courseName, credits) {
        try {
            api.post("/courses/", { name: courseName, credits: credits });
            fetchCourses();
        }
        catch (e) {
            console.error("Error adding course:", e)
        }
    }

    async function fetchDeadlines(courseName) {
        // code
    }

    async function addDeadline(courseName, name, due_date) {
        // code
    }

    async function fetchTasks(courseName, deadlineName) {
        // code
    }

    async function addTask(courseName, deadlineName, todo) {
        // code
    }

    useEffect(() => {
        fetchCourses();
    }, [])

    return (
        <>
            <div className="flex flex-row justify-start gap-20 m-20">
                {courses.map((course) => (
                    <CourseCard course={course} fetchDeadlines={fetchDeadlines} fetchCourses={fetchCourses} />
                ))}
            </div>

            <div>
                <CourseForm addCourse={addCourse} />
                <DeadlineForm addDeadline={addDeadline} courses={courses} />
                <TaskForm addTask={addTask} courses={courses} deadlines={deadlines} />
            </div>
        </>
    )
}