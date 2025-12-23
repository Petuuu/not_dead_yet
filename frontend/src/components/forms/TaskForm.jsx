import { useState } from "react";

export default function TaskForm({ addTask, courses, deadlines }) {
    const [courseId, setCourseId] = useState(0);
    const [deadlineId, setDeadlineId] = useState(0);
    const [todo, setTodo] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        if (courseId > 0 && deadlineId > 0 && todo) {
            addTask(courseId, deadlineId, todo);
            setTodo("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center border-b-[0.13vw] border-teal-500 m-[5vw] py-[0.5vw] w-[40vw]">
            <select
                value={courseId}
                onChange={e => setCourseId(+e.target.value)}
                className="bg-inherit w-[10vw] mr-[1vw] placeholder-stone-600 leading-tight focus:outline-none"
            >

                <option value={0} className="bg-[rgb(208,219,239)]"> Select a course </option>
                {
                    courses.map(course => (
                        <option key={course.id} value={course.id} className="bg-[rgb(208,219,239)]"> {course.name} </option>
                    ))
                }
            </select>

            <select
                value={deadlineId}
                onChange={e => setDeadlineId(+e.target.value)}
                className="bg-inherit w-[10vw] mr-[1vw] placeholder-stone-600 leading-tight focus:outline-none"
            >

                <option value={0} className="bg-[rgb(208,219,239)]"> Select a course </option>
                {
                    deadlines.map(deadline => deadline.course === courseId && (
                        <option key={deadline.id} value={deadline.id} className="bg-[rgb(208,219,239)]"> {deadline.name} </option>
                    ))
                }
            </select>

            <input
                type="text"
                value={todo}
                onChange={e => setTodo(e.target.value)}
                placeholder="Enter task name..."
                className="bg-inherit w-[10vw] placeholder-stone-600 leading-tight focus:outline-none"
            />

            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-[0.4vw] text-white py-[0.25vw] px-[0.4vw] rounded">
                Add deadline
            </button>
        </form>);
}