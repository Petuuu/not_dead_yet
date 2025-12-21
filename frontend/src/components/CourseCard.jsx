import { useState } from "react";
import Slides from "./Slides";

export default function CourseCard({ course, deadlines, tasks }) {
    return (
        <div className="flex flex-col gap-10 bg-slate-300 rounded-md w-[20vw] pt-5 pb-5">
            <h1 className="px-4 font-bold"> {course.name} ({course.credits} op) </h1>

            {deadlines.length == 0 ? (
                <p className="px-4"> No deadlines!! </p>

            ) : deadlines.length == 1 ? (
                <p className="px-4"> Single deadline: {deadlines[0].due} </p>

            ) : (
            <>
                <p className="px-4"> {deadlines.length} deadlines </p>
                <Slides deadlines={deadlines} />
            </>
            )
        }
        </div>
    );
}