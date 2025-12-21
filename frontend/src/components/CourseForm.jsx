import { useState } from "react";

export default function CourseForm({ addCourse }) {
    const [courseName, setCourseName] = useState("");
    const [credits, setCredits] = useState(0);

    function handleSubmit(e) {
        e.preventDefault();
        if (courseName && credits > 0) {
            addCourse(courseName, credits);
            setCourseName("");
            setCredits(0);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center border-b border-teal-500 m-20 py-2 w-[24vw]">
            <input
                type="text"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder="Enter course name..."
                className="bg-inherit w-[10vw] placeholder-stone-600 leading-tight focus:outline-none"
            />

            <div className="relative inline-flex items-center">
                <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(Number(e.target.value))}
                    className="bg-inherit w-[4vw] placeholder-stone-600 leading-tight focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col mr-3">
                    <button
                        type="button"
                        onClick={() => setCredits(c => c + 1)}
                        className="bg-inherit text-stone-600 leading-none text-[0.7vw] hover:opacity-70"
                    >
                    ▲
                    </button>
                    <button
                        type="button"
                        onClick={() => setCredits(c => Math.max(0, c - 1))}
                        className="bg-inherit text-stone-600 leading-none text-[0.7vw] hover:opacity-70"
                    >
                    ▼
                    </button>
                </div>
            </div>


            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded">
                Add course
            </button>
        </form>);
}