import { useState } from "react";
import Slides from "./Slides";

export default function CourseCard({ course, deadlines, tasks }) {
    const [slide, setSlide] = useState(0);

    const deadlineList = Array.isArray(deadlines) ? deadlines : [];

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-5 pb-5">
            <h1 className="px-4 font-bold"> {course.name} ({course.credits} op) </h1>

            {deadlineList.length === 0 ? (
                <p className="px-4"> No deadlines!! </p>

            ) : deadlineList.length === 1 ? (
                <p className="px-4"> {deadlineList[0].name}: {deadlineList[0].due} </p>

            ) : (
            <>
                <p className="px-4"> {deadlineList[slide].due} </p>
                <Slides deadlines={deadlineList} slide={slide} setSlide={setSlide} />
            </>
            )
        }
        </div>
    );
}