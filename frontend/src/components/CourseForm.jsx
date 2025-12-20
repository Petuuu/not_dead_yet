import { useState } from "react";

export default function CourseForm({ addCourse }) {
    const [courseName, setCourseName] = useState("");
    const [credits, setCredits] = useState(0)

    function handleSubmit(e) {
        e.preventDefault();
        if (courseName && credits > 0) {
            addCourse(courseName, credits);
            setCourseName("");
            setCredits(0)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center border-b border-teal-500 m-10 py-2 w-[33vw]">
            <input
                type="text"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder="Enter course name..."
                className="w-[18vw] text-gray-700 leading-tight focus:outline-none"
            />
            <input
                type="number"
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                placeholder="Credits..."
                className="w-[5vw] mx-5 text-gray-700 leading-tight focus:outline-none"
            />
            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded">
                Add course
            </button>
        </form>)
}