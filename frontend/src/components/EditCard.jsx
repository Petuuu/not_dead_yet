import { useState, useEffect } from "react";
import Slides from "./Slides";

export default function EditCard({
    course,
    deadlines,
    tasks,
    slide,
    setSlide,
    setEdit,
    duplicateDl,
    updateCourse,
    updateDlName,
    updateDlDue,
    updateTodo,
    deleteCourse,
    deleteDeadline,
    deleteTask,
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

    async function handleSave() {
        const taskLookup = new Map(tasks.map(t => [t.id, t.todo]));
        const deadlineLookup = new Map(deadlines.map(d => [d.id, d]));

        const taskUpdates = Object.entries(localTasks)
            .filter(([taskId, todo]) => taskLookup.get(+taskId) !== todo)
            .map(([taskId, todo]) => updateTodo(+taskId, todo));

        const dlNameUpdates = Object.entries(localDlName)
            .filter(([deadlineId, name]) => (deadlineLookup.get(+deadlineId)?.name ?? "") !== name)
            .map(([deadlineId, name]) => updateDlName(+deadlineId, name));

        const dlDueUpdates = Object.entries(localDlDue)
            .filter(([deadlineId, due]) => Array.isArray(due) && due.join("/") !== (deadlineLookup.get(+deadlineId)?.due ?? ""))
            .map(([deadlineId, due]) => updateDlDue(+deadlineId, due, { refresh: false }));

        const courseChanged = localCourse.name !== course.name || +localCourse.credits !== course.credits;
        const courseUpdate = courseChanged ? updateCourse(course.id, localCourse.name, +localCourse.credits) : null;

        await Promise.all([
            ...taskUpdates,
            ...dlNameUpdates,
            ...dlDueUpdates,
            courseUpdate
        ].filter(Boolean));

        await fetchAll();
        setEdit(prev => ({ ...prev, [course.id]: false }));
    }

    function handleDelete(type, id, name) {
        const text = `Are you sure you want to delete ${type} "${name}"`;

        if (window.confirm(text)) {
            if (type === "course") deleteCourse(id);
            else deleteDeadline(id);
        }
    }

    function handleDueChange(idx, value) {
        setLocalDlDue(prev => {
            const existing = prev[currDl.id];
            const updated = [...existing];
            updated[idx] = value;
            return { ...prev, [currDl.id]: updated };
        });
    };

    function handleTaskChange(e) {
        const id = +e.target.id;
        const todo = e.target.value;
        setLocalTasks(prev => ({ ...prev, [id]: todo }));
    }

    useEffect(() => {
        const name = {};
        const due = {};

        deadlines.forEach(dl => {
            const parts = dl.due.split("/");
            name[dl.id] = dl.name;
            due[dl.id] = [parts[0], parts[1], parts[2]];
        });

        setLocalDlName(name);
        setLocalDlDue(due);
    }, [deadlines])

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1.5vw] pb-[1.5vw]">
            <div className="flex items-center justify-between mr-[1vw]">
                <h1 className="flex mx-[1vw] font-bold">
                    <input
                        id={course.id}
                        value={localCourse.name}
                        onChange={e => setLocalCourse(prev => ({ ...prev, name: e.target.value }))}
                        autoComplete="off"
                        className={"bg-inherit mr-[0.5vw] pb-[0.2vw] w-[9vw] border-b-[0.13vw] border-neutral-500 outline-none"}
                    />

                    (<input
                        id={course.id}
                        value={localCourse.credits}
                        onChange={e => setLocalCourse(prev => ({ ...prev, credits: e.target.value }))}
                        autoComplete="off"
                        className={"bg-inherit pb-[0.2vw] w-[1vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                    /> op)
                </h1>

                <div className="flex gap-[0.5vw] items-center">
                    <button onClick={() => handleDelete("course", course.id, course.name)}>
                        <img src="/delete.png" alt="delete" className="size-[1vw] opacity-85" />
                    </button>

                    <button onClick={handleSave}>
                        <img src="/check.png" alt="confirm" className="size-[1.1vw]" />
                    </button>
                </div>
            </div>

            {
                deadlines.length === 0 ? (
                    <p className="mx-[1vw]"> No deadlines!! </p>

                ) : deadlines.length === 1 ? (
                    <div className="flex items-center justify-between mx-[1vw]">
                        <p className="flex items-center gap-[0.3vw]">
                            <img src="/calendar.png" alt="calendar icon" className="size-[1vw]" />

                            <input
                                id={currDl.id}
                                value={localDlName[currDl.id] ?? currDl.name}
                                onChange={e => setLocalDlName(prev => ({ ...prev, [currDl.id]: e.target.value }))}
                                autoComplete="off"
                                className={"bg-inherit mb-[0.2vw] pb-[0.2vw] w-[5vw] border-b-[0.13vw] border-neutral-500 outline-none"}
                            /> :

                            <input
                                id={currDl.id}
                                value={localDlDue[currDl.id]?.[0] ?? currDue.getDate()}
                                onChange={e => handleDueChange(0, e.target.value)}
                                autoComplete="off"
                                className={"bg-inherit mx-[0.1vw] mb-[0.2vw] pb-[0.2vw] w-[1.2vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                            /> /

                            <input
                                value={localDlDue[currDl.id]?.[1] ?? currDue.getMonth() + 1}
                                onChange={e => handleDueChange(1, e.target.value)}
                                autoComplete="off"
                                className={"bg-inherit mx-[0.1vw] mb-[0.2vw] pb-[0.2vw] w-[1.2vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                            /> /

                            <input
                                value={localDlDue[currDl.id]?.[2] ?? currDue.getFullYear()}
                                onChange={e => handleDueChange(2, e.target.value)}
                                autoComplete="off"
                                className={"bg-inherit mx-[0.1vw] mb-[0.2vw] pb-[0.2vw] w-[2.5vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                            />
                        </p>

                        <div className="flex gap-[0.5vw] items-center">
                            <button onClick={() => handleDelete("deadline", currDl.id, currDl.name)}>
                                <img src="/delete.png" alt="delete" className="size-[1vw] opacity-85" />
                            </button>

                            <button onClick={() => duplicateDl(currDl.id)}>
                                <img src="/duplicate.png" alt="confirm" className="size-[1.1vw]" />
                            </button>
                        </div>
                    </div>

                ) : (
                    <>
                        <div className="flex items-center justify-between mx-[1vw]">
                            <div className="flex items-center gap-[0.3vw]">
                                <img src="/calendar.png" alt="calendar icon" className="size-[1vw]" />

                                <input
                                    id={currDl.id}
                                    value={localDlDue[currDl.id]?.[0] ?? currDue.getDate()}
                                    onChange={e => handleDueChange(0, e.target.value)}
                                    autoComplete="off"
                                    className={"bg-inherit mx-[0.1vw] mb-[0.2vw] pb-[0.2vw] w-[1.2vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                                /> /

                                <input
                                    value={localDlDue[currDl.id]?.[1] ?? currDue.getMonth() + 1}
                                    onChange={e => handleDueChange(1, e.target.value)}
                                    autoComplete="off"
                                    className={"bg-inherit mx-[0.1vw] mb-[0.2vw] pb-[0.2vw] w-[1.2vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                                /> /

                                <input
                                    value={localDlDue[currDl.id]?.[2] ?? currDue.getFullYear()}
                                    onChange={e => handleDueChange(2, e.target.value)}
                                    autoComplete="off"
                                    className={"bg-inherit mx-[0.1vw] mb-[0.2vw] pb-[0.2vw] w-[2.5vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                                />
                            </div>

                            <div className="flex gap-[0.5vw] items-center">
                                <button onClick={() => handleDelete("deadline", currDl.id, currDl.name)}>
                                    <img src="/delete.png" alt="delete" className="size-[1vw] opacity-85" />
                                </button>

                                <button onClick={() => duplicateDl(currDl.id)}>
                                    <img src="/duplicate.png" alt="confirm" className="size-[1.1vw]" />
                                </button>
                            </div>
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
                    <p className="mx-[1vw]"> No tasks!! </p>

                ) : (
                    <>
                        {
                            tasks.map(t => {
                                const taskDate = toDate(t.dlDue);
                                const isOld = currDue && taskDate ? taskDate < currDue : false;
                                const isCurr = t.deadline === currDl?.name;
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
                                        <div key={t.id} className="flex items-center justify-between mx-[1vw]">
                                            <div>
                                                {shouldInsert && <hr className="mx-[1vw] mb-[1vw] border-neutral-800" />}
                                                <input
                                                    id={t.id}
                                                    value={localTasks[t.id] ?? t.todo}
                                                    onChange={handleTaskChange}
                                                    autoComplete="off"
                                                    className={`bg-inherit mx-[2.3vw] pb-[0.2vw] w-[11vw] border-b-[0.13vw] border-neutral-500 outline-none ${isOld ? "text-neutral-500" : "text-black"}`}
                                                />
                                            </div>

                                            <button onClick={() => deleteTask(t.id)}>
                                                <img src="/delete.png" alt="delete" className="size-[1vw] opacity-85" />
                                            </button>
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