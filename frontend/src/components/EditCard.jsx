import { useState } from "react";
import Slides from "./Slides";

export default function EditCard({ course, deadlines, tasks, setEdit, updateTodo, fetchAll }) {
    const [slide, setSlide] = useState(0);
    const [localTasks, setLocalTasks] = useState({});

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

    function handleTaskChange(e) {
        const id = +e.target.id;
        const todo = e.target.value;
        setLocalTasks(prev => ({ ...prev, [id]: todo }));
    }

    async function handleClick() {
        for (const [taskId, todo] of Object.entries(localTasks)) {
            await updateTodo(+taskId, todo);
        }
        await fetchAll();
        setEdit(prev => ({ ...prev, [course.id]: false }));
    }

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1.5vw] pb-[1.5vw]">
            <div className="flex items-center justify-between mr-[1vw]">
                <h1 className="mx-[1vw] font-bold"> {course.name} ({course.credits} op) </h1>

                <button onClick={handleClick}>
                    <img src="/check.png" alt="edit" className="size-[1.1vw]" />
                </button>
            </div>

            {
                deadlines.length === 0 ? (
                    <p className="mx-[1vw]"> No deadlines!! </p>

                ) : deadlines.length === 1 ? (
                    <p className="flex items-center gap-[0.3vw] mx-[1vw]">
                        <img
                            src="/calendar.png"
                            alt="calendar icon"
                            className="size-[1vw]"
                        /> {deadlines[0].name}: {deadlines[0].due}
                    </p>

                ) : (
                    <>
                        <p className="flex items-center gap-[0.3vw] mx-[1vw]">
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
                        />
                    </>
                )
            }

            {
                tasks.length === 0 ? (
                    <p className="mx-[1vw]"> No tasks!!!</p>

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
                                        <p className="mx-[1vw]"> No tasks!! </p>
                                    ) : null
                                };

                                if (isOld || isCurr) {
                                    return (
                                        <div key={task.id}>
                                            {shouldInsert && <hr className="mx-[1vw] mb-[1vw] border-neutral-800" />}
                                            <input
                                                type="text"
                                                id={task.id}
                                                value={localTasks[task.id] ?? task.todo}
                                                onChange={handleTaskChange}
                                                className={`bg-inherit mx-[3.3vw] pb-[0.2vw] w-[11vw] border-b-[0.13vw] border-neutral-500 peer-checked:line-through peer-checked:text-neutral-400 outline-none ${isOld ? "text-neutral-500" : "text-black"}`}
                                            />
                                        </div>
                                    );
                                }

                                return null;
                            })
                        }
                    </>
                )
            }
        </div>
    );
}