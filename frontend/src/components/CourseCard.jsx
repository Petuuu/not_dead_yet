import { useState, useEffect } from "react";
import Slides from "./Slides";

export default function CourseCard({ course, deadlines, tasks }) {
    const [slide, setSlide] = useState(0);
    const [deadlineId, setDeadlineId] = useState(deadlines?.[0]?.id ?? null);

    const deadlineList = Array.isArray(deadlines) ? deadlines : [];
    const tasksList = Array.isArray(tasks) ? tasks : [];

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1vw] pb-[1vw]">
            <h1 className="px-[1vw] font-bold"> {course.name} ({course.credits} op) </h1>

            {
                deadlineList.length === 0 ? (
                    <p className="px-[1vw]"> No deadlines!! </p>

                ) : deadlineList.length === 1 ? (
                    <p className="px-[1vw]">
                        {deadlineList[0].name}: {deadlineList[0].due}
                    </p>

                ) : (
                    <>
                        <p className="px-[1vw]">
                            {deadlineList[slide].due}
                        </p>

                        <Slides
                            deadlines={deadlineList}
                            slide={slide}
                            setSlide={setSlide}
                            setDeadlineId={setDeadlineId}
                        />
                    </>
                )
            }

            {
                tasksList.length === 0 ? (
                    <p className="px-[1vw]"> No tasks!!!</p>

                ) : (
                    <>
                        {
                            tasksList.map(task => task.deadline <= deadlineList[slide].name && (
                                <p key={task.id} className="px-[1vw]">
                                    {task.todo}
                                </p>
                            ))
                        }
                    </>
                )
            }
        </div>
    );
}