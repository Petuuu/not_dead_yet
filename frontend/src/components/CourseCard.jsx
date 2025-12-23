import { useState } from "react";
import Slides from "./Slides";

export default function CourseCard({ course, deadlines, tasks, updateTask }) {
    const [slide, setSlide] = useState(0);
    const [deadlineId, setDeadlineId] = useState(deadlines?.[0]?.id ?? null);

    const deadlineList = Array.isArray(deadlines) ? deadlines : [];
    const tasksList = Array.isArray(tasks) ? tasks : [];

    let isInserted = false;

    function handleChange(e) {
        const taskId = +e.target.id;
        const task = tasksList.find(t => t.id === taskId);
        updateTask(taskId, !task.checked);
    }

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1vw] pb-[1vw]">
            <h1 className="px-[1vw] font-bold"> {course.name} ({course.credits} op) </h1>

            {
                deadlineList.length === 0 ? (
                    <p className="px-[1vw]"> No deadlines!! </p>

                ) : deadlineList.length === 1 ? (
                    <p className="flex items-center gap-[0.3vw] px-[1vw]">
                        <img
                            src="/calendar.png"
                            alt="calendar icon"
                            className="size-[1vw]"
                        /> {deadlineList[0].name}: {deadlineList[0].due}
                    </p>

                ) : (
                    <>
                        <p className="flex items-center gap-[0.3vw] px-[1vw]">
                            <img
                                src="/calendar.png"
                                alt="calendar icon"
                                className="size-[1vw]"
                            /> {deadlineList[slide].due}
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
                            tasksList.map(task => {
                                const hasOldTasks = tasksList.some(
                                    task => task.deadline < deadlineList[slide].name
                                );
                                const isOld = task.deadline < deadlineList[slide].name
                                const isCurr = task.deadline === deadlineList[slide].name;

                                const shouldInsert = isCurr && hasOldTasks && !isInserted;
                                if (shouldInsert) isInserted = true;

                                return (
                                    <>
                                        {shouldInsert && <hr className="mx-[1vw] mb-[0.5vw] border-neutral-800" />}
                                        <div key={task.id} className="flex items-center px-[1vw]">
                                            <input
                                                type="checkbox"
                                                id={task.id}
                                                checked={task.checked}
                                                onChange={handleChange}
                                                className="peer size-[1.3vw] appearance-none rounded-full border border-neutral-700 checked:bg-teal-500 checked:border-teal-500"
                                            />

                                            <label className={`peer-checked:line-through peer-checked:text-neutral-400 px-[1vw] ${isOld ? "text-neutral-500" : "text-black"}`}>
                                                {task.todo}
                                            </label>
                                        </div>
                                    </>
                                )
                            })
                        }
                    </>
                )
            }
        </div>
    );
}