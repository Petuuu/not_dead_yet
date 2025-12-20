import { useState, useEffect } from "react";
import api from "../api";
import CourseForm from "./CourseForm";
import CourseCard from "./CourseCard";

export default function Courses() {
    const [courses, setCourses] = useState([]);

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

    useEffect(() => {
        fetchCourses();
    }, [])

    return (
        <>
            <div className="flex flex-row justify-start gap-20 m-20">
                {courses.map((course) => (
                    <CourseCard course={course} />
                ))}
            </div>

            <div>
                <CourseForm addCourse={addCourse} />
            </div>
        </>
    )
}