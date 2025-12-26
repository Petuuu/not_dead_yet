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
        <form onSubmit={handleSubmit} className="flex items-center border-b-[0.13vw] border-teal-500 m-[5vw] py-[0.5vw] w-[20vw]">
            <input
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder="Enter course name..."
                autoComplete="off"
                className="bg-inherit w-[10vw] placeholder-stone-600 focus:outline-none"
            />

            <div className="relative inline-flex items-center">
                <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(+e.target.value)}
                    autoComplete="off"
                    className="bg-inherit w-[4vw] placeholder-stone-600 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                />

                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col mr-[0.8vw]">
                    <button
                        type="button"
                        onClick={() => setCredits(c => c + 1)}
                        className="bg-inherit text-stone-600 text-[0.7vw] hover:opacity-70"
                    >
                    ▲
                    </button>
                    <button
                        type="button"
                        onClick={() => setCredits(c => Math.max(0, c - 1))}
                        className="bg-inherit text-stone-600 text-[0.7vw] hover:opacity-70"
                    >
                    ▼
                    </button>
                </div>
            </div>


            <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-[0.3vw] text-white py-[0.25vw] px-[0.4vw] rounded">
                Add course
            </button>
        </form>);
}