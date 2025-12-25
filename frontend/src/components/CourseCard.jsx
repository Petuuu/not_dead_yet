import { useState } from "react";
import Slides from "./Slides";

export default function CourseCard({ course, deadlines, tasks, updateTask, setEdit }) {
    const [slide, setSlide] = useState(0);
    const [deadlineId, setDeadlineId] = useState(deadlines?.[0]?.id ?? null);

    const toDate = (dlArr) => {
        if (!Array.isArray(dlArr) || dlArr.length < 3) return null;
        return new Date(dlArr[2], dlArr[1] - 1, dlArr[0]);
    };

    const currDl = deadlines[slide];
    const currDue = toDate(currDl?.dlDue);
    const hasOldTasks = currDue
        ? tasks.some(task => {
            const taskDate = toDate(task.dlDue);
            return taskDate ? taskDate < currDue : false;
        })
        : false;

    let isInserted = false;
    let tasksOutput = true;
    let hasCurr = false;

    function handleChange(e) {
        const taskId = +e.target.id;
        const task = tasks.find(t => t.id === taskId);
        updateTask(taskId, !task.checked);
    }

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1.5vw] pb-[1.5vw]">
            <div className="flex items-center justify-between pr-[1vw]">
                <h1 className="px-[1vw] font-bold"> {course.name} ({course.credits} op) </h1>

                <button onClick={() => setEdit(prev => ({ ...prev, [course.id]: true }))}>
                    <img src="/edit.png" alt="edit" className="size-[0.9vw] opacity-60" />
                </button>
            </div>

            {
                deadlines.length === 0 ? (
                    <p className="px-[1vw]"> No deadlines!! </p>

                ) : deadlines.length === 1 ? (
                    <p className="flex items-center gap-[0.3vw] px-[1vw]">
                        <img
                            src="/calendar.png"
                            alt="calendar icon"
                            className="size-[1vw]"
                        /> {deadlines[0].name}: {deadlines[0].due}
                    </p>

                ) : (
                    <>
                        <p className="flex items-center gap-[0.3vw] px-[1vw]">
                            <img
                                src="/calendar.png"
                                alt="calendar icon"
                                className="size-[1vw]"
                            /> {deadlines[slide].due}
                        </p>

                        <Slides
                            deadlines={deadlines}
                            slide={slide}
                            setSlide={setSlide}
                            setDeadlineId={setDeadlineId}
                        />
                    </>
                )
            }

            {
                tasks.length === 0 ? (
                    <p className="px-[1vw]"> No tasks!!!</p>

                ) : (
                    <>
                        {
                            tasks.map(task => {
                                const taskDate = toDate(task.dlDue);
                                const isOld = currDue && taskDate ? taskDate < currDue : false;
                                const isCurr = task.deadline === currDl?.name;
                                if (isCurr) hasCurr = true;

                                const shouldInsert = isCurr && hasOldTasks && !isInserted;
                                if (shouldInsert) isInserted = true;

                                if (!isOld && !isCurr && !hasOldTasks && !hasCurr) {
                                    return tasksOutput ? (
                                        tasksOutput = false,
                                        <p className="px-[1vw]"> No tasks!! </p>
                                    ) : null
                                };

                                if (isOld || isCurr) {
                                    return (
                                        <div key={task.id}>
                                            {shouldInsert && <hr className="mx-[1vw] mb-[1vw] border-neutral-800" />}
                                            <div className="flex items-center px-[1vw]">
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
                                        </div>
                                    );
                                }
                            })
                        }
                    </>
                )
            }
        </div>
    );
}