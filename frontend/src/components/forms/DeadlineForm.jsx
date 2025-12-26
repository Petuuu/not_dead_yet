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
        <form onSubmit={handleSubmit} className="flex items-center border-b-[0.13vw] border-teal-500 m-[5vw] py-[0.5vw] w-[40vw]">
            <select
                value={courseId}
                onChange={e => setCourseId(+e.target.value)}
                className="bg-inherit w-[10vw] mr-[1vw] placeholder-stone-600 focus:outline-none"
            >

                <option value={0} className="bg-[rgb(208,219,239)]"> Select a course </option>
                {
                    courses.map(course => (
                        <option key={course.id} value={course.id} className="bg-[rgb(208,219,239)]"> {course.name} </option>
                    ))
                }
            </select>

            <input
                value={deadlineName}
                onChange={e => setDeadlineName(e.target.value)}
                placeholder="Enter deadline name..."
                autoComplete="off"
                className="bg-inherit w-[10vw] placeholder-stone-600 focus:outline-none"
            />

            <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-inherit w-[10vw] mx-[0.8vw] text-stone-900 focus:outline-none" />

            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-[0.4vw] text-white py-[0.25vw] px-[0.4vw] rounded">
                Add deadline
            </button>
        </form>);
}