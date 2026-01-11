import Slides from "../Slides";

export default function CourseCard({
    course,
    deadlines,
    tasks,
    slide,
    setSlide,
    setEdit,
    updateChecked
}) {
    const toDate = (dlArr) => {
        if (!Array.isArray(dlArr) || dlArr.length < 3) return null;
        return new Date(dlArr[2], dlArr[1] - 1, dlArr[0]);
    };

    const currDl = deadlines[slide];
    const currDue = toDate(currDl?.dlDue);
    let dueText;
    const tdy = new Date();
    const diff = Math.ceil((currDue - tdy) / (1000 * 60 * 60 * 24));
    const color = diff < 0
        ? "text-black"
        : diff <= 1
            ? "text-red-600"
            : diff <= 3
                ? "text-amber-600"
                : "text-green-600"

    const hasOldTasks = currDue
        ? tasks.some(t => {
            const taskDate = toDate(t.dlDue);
            return taskDate ? taskDate < currDue : false;
        })
        : false;

    let isInserted = false;
    let tasksOutput = true;
    let hasCurr = false;

    if (diff < -1) { dueText = `${Math.abs(diff)} days since due`; }
    else {
        switch (diff) {
            case -1:
            dueText = "due yesterday";
            break;
            case 0:
            dueText = "due today";
            break;
            case 1:
            dueText = "due tomorrow";
            break;
            default:
            dueText = `${diff} days until due`;
        }
    }

    async function handleChange(e) {
        const id = +e.target.id;
        const task = tasks.find(t => t.id === id);
        await updateChecked(id, !task.checked);
    }

    return (
        <div className="flex flex-col gap-6 bg-slate-300 rounded-md w-[20vw] pt-[1.5vw] pb-[1.5vw]">
            <div className="flex items-center justify-between mr-[1vw]">
                <h1 className="mx-[1vw] font-bold"> {course.name} ({course.credits} ECTS) </h1>

                <button onClick={() => setEdit(prev => ({ ...prev, [course.id]: true }))}>
                    <img src="/edit.png" alt="edit" className="size-[0.9vw] opacity-60" />
                </button>
            </div>

            {
                deadlines.length === 0 ? (
                    <p className="mx-[1vw]"> No deadlines!! </p>

                ) : deadlines.length === 1 ? (
                    <div className="flex items-center gap-[0.3vw] mx-[1vw]">
                        <img src="/calendar.png" alt="calendar icon" className="size-[1vw]" />
                        <p> {deadlines[0].name}: {deadlines[0].due} <span className={`font-bold pl-[0.3vw] ${color}`}> {dueText} </span> </p>
                    </div>

                ) : (
                    <>
                        <div className="flex items-center gap-[0.3vw] mx-[1vw]">
                            <img src="/calendar.png" alt="calendar icon" className="size-[1vw]"
                            />
                            <p> {deadlines[slide].due} <span className={`font-bold pl-[0.3vw] ${color}`}> {dueText} </span> </p>
                        </div>

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
                                        <p key={`no-tasks-${course.id}`} className="mx-[1vw]"> No tasks!! </p>
                                    ) : null
                                };

                                if (isOld || isCurr) {
                                    return (
                                        <div key={t.id}>
                                            {shouldInsert && <hr className="mx-[1vw] mb-[1vw] border-neutral-800" />}
                                            <div className="flex items-center mx-[1vw]">
                                                <input
                                                    type="checkbox"
                                                    id={t.id}
                                                    checked={t.checked}
                                                    onChange={handleChange}
                                                    className="peer shrink-0 size-[1.3vw] appearance-none rounded-full border border-neutral-700 checked:bg-teal-500 checked:border-teal-500"
                                                />

                                                <label className={`mx-[1vw] peer-checked:line-through peer-checked:text-neutral-400 ${isOld ? "text-neutral-500" : "text-black"}`}>
                                                    {t.todo}
                                                </label>
                                            </div>
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