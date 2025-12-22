import { useState } from "react";

export default function DeadlineForm({ addDeadline, courses }) {
    const [courseId, setCourseId] = useState(0);
    const [deadlineName, setDeadlineName] = useState("");
    const [dueDate, setDueDate] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        if (courseId > 0 && deadlineName && dueDate) {
            addDeadline(courseId, deadlineName, dueDate);
            setDeadlineName("");
            setDueDate("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center border-b-[0.13vw] border-teal-500 m-20 py-2 w-[40vw]">
            <select
                value={courseId}
                onChange={e => setCourseId(Number(e.target.value))}
                className="bg-inherit w-[10vw] mr-5 placeholder-stone-600 leading-tight focus:outline-none"
            >

                <option value={0} className="bg-[rgb(208,219,239)]"> Select a course </option>
                {courses.map(course => (
                    <option key={course.id} value={course.id} className="bg-[rgb(208,219,239)]"> {course.name} </option>
                ))}
            </select>

            <input
                type="text"
                value={deadlineName}
                onChange={e => setDeadlineName(e.target.value)}
                placeholder="Enter deadline name..."
                className="bg-inherit w-[10vw] placeholder-stone-600 leading-tight focus:outline-none"
            />

            <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-inherit w-[10vw] mx-4 text-stone-900 leading-tight focus:outline-none" />

            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded">
                Add deadline
            </button>
        </form>);
}