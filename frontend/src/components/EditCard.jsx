import { useState } from "react";
import Slides from "./Slides";

export default function EditCard({
    course,
    deadlines,
    tasks,
    slide,
    setSlide,
    setEdit,
    updateCourse,
    updateDlName,
    updateDlDue,
    updateTodo,
    fetchAll
}) {
    const [localCourse, setLocalCourse] = useState({ name: course.name, credits: course.credits });
    const [localDlName, setLocalDlName] = useState({});
    const [localDlDue, setLocalDlDue] = useState({});
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

    async function handleClick() {
        for (const [taskId, todo] of Object.entries(localTasks)) {
            await updateTodo(+taskId, todo);
        }
        for (const [deadlineId, name] of Object.entries(localDlName)) {
            await updateDlName(+deadlineId, name);
        }
        /*for (const [deadlineId, due] of Object.entries(localDlDue)) {
            await updateDlDue(+deadlineId, due);
        }*/
        await updateCourse(course.id, localCourse.name, localCourse.credits);

        await fetchAll();
        setEdit(prev => ({ ...prev, [course.id]: false }));
    }

    function handleDueChange(e) {
        // code
    }

    function handleTaskChange(e) {
        const id = +e.target.id;
        const todo = e.target.value;
        setLocalTasks(prev => ({ ...prev, [id]: todo }));
    }

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1.5vw] pb-[1.5vw]">
            <div className="flex items-center justify-between mr-[1vw]">
                <h1 className="flex mx-[1vw] font-bold">
                    <input
                        type="text"
                        id={course.id}
                        value={localCourse.name}
                        onChange={e => setLocalCourse(prev => ({ ...prev, name: e.target.value }))}
                        autoComplete="off"
                        className={"bg-inherit mr-[0.5vw] pb-[0.2vw] w-[9vw] border-b-[0.13vw] border-neutral-500 outline-none"}
                    />

                    (<input
                        type="text"
                        id={course.id}
                        value={localCourse.credits}
                        onChange={e => setLocalCourse(prev => ({ ...prev, credits: e.target.value }))}
                        autoComplete="off"
                        className={"bg-inherit ml-[0.2vw] pb-[0.2vw] w-[1vw] border-b-[0.13vw] border-neutral-500 outline-none"}
                    /> op)
                </h1>

                <button onClick={handleClick}>
                    <img src="/check.png" alt="edit" className="size-[1.1vw]" />
                </button>
            </div>

            {
                deadlines.length === 0 ? (
                    <p className="mx-[1vw]"> No deadlines!! </p>

                ) : deadlines.length === 1 ? (
                    <div className="flex items-center gap-[0.3vw] mx-[1vw]">
                        <img src="/calendar.png" alt="calendar icon" className="size-[1vw]" />
                        <p> {deadlines[slide].name}: {deadlines[slide].due} </p>
                    </div>

                ) : (
                    <>
                        <div className="flex items-center gap-[0.3vw] mx-[1vw]">
                            <img src="/calendar.png" alt="calendar icon" className="size-[1vw]" />
                            <p> {deadlines[slide].due} </p>
                        </div>

                            <Slides
                                deadlines={deadlines}
                                slide={slide}
                                setSlide={setSlide}
                                edit={true}
                                localDlName={localDlName}
                                setLocalDlName={setLocalDlName}
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
                                                autoComplete="off"
                                                className={`bg-inherit mx-[3.3vw] pb-[0.2vw] w-[11vw] border-b-[0.13vw] border-neutral-500 outline-none ${isOld ? "text-neutral-500" : "text-black"}`}
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