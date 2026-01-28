import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import CourseCard from "./Cards/CourseCard";
import CourseForm from "./forms/CourseForm";
import DeadlineForm from "./forms/DeadlineForm";
import EditCard from "./Cards/EditCard"
import TaskForm from "./forms/TaskForm";
import Instructions from "./Instructions";

export default function Courses() {
    const navigate = useNavigate();
    const { id: value } = useParams();
    const [courses, setCourses] = useState([]);
    const [deadlines, setDeadlines] = useState({});
    const [tasks, setTasks] = useState({});
    const [slide, setSlide] = useState({});
    const [edit, setEdit] = useState({});
    const [valid, setValid] = useState(true);

    async function fetchAll() {
        try {
            const res = await api.get(`/courses/${value}`);
            const coursesData = Array.isArray(res.data) ? res.data : [];
            setCourses(coursesData);

            for (const c of coursesData) {
                try {
                    const dlsRes = await api.get(`/deadlines/${value}/${c.id}`);
                    setDeadlines(prev => ({ ...prev, [c.id]: Array.isArray(dlsRes.data) ? dlsRes.data : [] }));
                }
                catch (e) {
                    console.error(`Error fetching deadlines for course ${c.id}:`, e);
                    setDeadlines(prev => ({ ...prev, [c.id]: [] }));
                }

                try {
                    const tasksRes = await api.get(`/tasks/${value}/${c.id}`);
                    setTasks(prev => ({ ...prev, [c.id]: Array.isArray(tasksRes.data) ? tasksRes.data : [] }));
                }
                catch (e) {
                    console.error(`Error fetching tasks for course ${c.id}:`, e);
                    setTasks(prev => ({ ...prev, [c.id]: [] }));
                }
            }
        }
        catch (e) {
            console.error("Error fetching courses:", e);
            setCourses([]);
        }
    };

    async function addCourse(courseName, credits) {
        try {
            await api.post("/courses", { name: courseName, credits: credits }, { params: { tracker: value } });
            await fetchAll();
        }
        catch (e) {
            console.error("Error adding course:", e)
        }
    };

    async function addDeadline(courseId, name, due_date) {
        try {
            const res = await api.post("/deadlines", { course: courseId, name: name, due: due_date }, { params: { tracker: value } });
            setDeadlines(prev => ({
                ...prev,
                [courseId]: [...(prev[courseId] || []), res.data]
            }))
        }
        catch (e) {
            console.error("Error adding deadline:", e);
        }
    };

    async function duplicateDl(deadlineId) {
        try {
            const res = await api.post(`/deadlines/${deadlineId}`);
            if (typeof (res.data) === "string") { alert(res.data); }
            else {await fetchAll();}
        }
        catch (e) {
            console.error(`Error duplicating deadline ${deadlineId}`);
        }
    }

    async function addTask(courseId, deadlineId, todo) {
        try {
            const res = await api.post("/tasks", { course: courseId, deadline: deadlineId, todo: todo }, { params: { tracker: value } });
            setTasks(prev => ({
                ...prev,
                [courseId]: [...(prev[courseId] || []), res.data]
            }))
        }
        catch (e) {
            console.error("Error adding task:", e)
        }
    };

    async function updateCourse(courseId, name, credits) {
        try {
            await api.put(`/courses/${courseId}`, { name: name, credits: credits });
        }
        catch (e) {
            console.error(`Error updating course ${courseId}:`, e);
        }
    }

    async function updateDlName(deadlineId, name) {
        try {
            await api.put(`/deadlines/${deadlineId}/name`, { name: name });
        }
        catch (e) {
            console.error(`Error updating deadline ${deadlineId}:`, e);
        }
    }

    async function updateDlDue(deadlineId, due) {
        try {
            await api.put(`/deadlines/${deadlineId}/due`, { day: +due[0], month: +due[1], year: +due[2] });
            await fetchAll();
        }
        catch (e) {
            console.error(`Error updating deadline ${deadlineId}:`, e);
        }
    }

    async function updateChecked(taskId, checked) {
        try {
            const res = await api.put(`/tasks/${taskId}/checked`, { checked: checked });
            setTasks(prev => ({
                ...prev,
                [res.data.course]: prev[res.data.course].map(task =>
                    task.id === taskId
                        ? { ...task, checked }
                        : task
                )
            }))
        }
        catch (e) {
            console.error(`Error updating task ${taskId}:`, e);
        }
    }

    async function updateTodo(taskId, todo) {
        try {
            await api.put(`/tasks/${taskId}/todo`, { todo: todo });
            await fetchAll();
        }
        catch (e) {
            console.error(`Error updating task ${taskId}:`, e);
        }
    }

    async function deleteCourse(courseId) {
        try {
            await api.delete(`/courses/${courseId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error deleting course ${courseId}:`, e);
        }
    }

    async function deleteDeadline(deadlineId) {
        try {
            await api.delete(`/deadlines/${deadlineId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error deleting deadline ${deadlineId}:`, e);
        }
    }

    async function deleteTask(taskId) {
        try {
            await api.delete(`/tasks/${taskId}`);
            await fetchAll();
        }
        catch (e) {
            console.error(`Error deleting task ${taskId}:`, e);
        }
    }

    async function load() {
        try {
            const res = await api.get(`/courses/${value}`);
            const coursesData = Array.isArray(res.data) ? res.data : [];
            setCourses(coursesData);
            coursesData.forEach(c => setEdit(prev => ({ ...prev, [c.id]: false })));
            coursesData.forEach(c => setSlide(prev => ({ ...prev, [c.id]: 0 })));
        } catch (e) {
            console.error("Error loading courses:", e);
            setCourses([]);
        }
    }

    async function createTracker() {
        try {
            const res = await api.post("/trackers");

            if (!isNaN(res.data)) {
                alert(`Please wait ${res.data} seconds before creating another tracker.`);
            }

            else if (res.data.value) {
                setValid(true);
                navigate(`/${res.data.value}`);
            }
        }
        catch (e) {
            console.error("Error creating tracker:", e);
        }
    }

    async function getTrackers() {
        if (!value) return;

        try {
            await api.get(`/trackers/${value}`);
            await fetchAll();
            await load();
            setValid(true);
        }
        catch (e) {
            console.error(`Error validating tracker ${value}:`, e);
            setValid(false);
        }
    }

    async function deleteTracker() {
        const text = "Are you sure you want to delete current tracker?";

        if (window.confirm(text)) {
            try {
                await api.delete(`/trackers/${value}`);
                setValid(false);
                navigate("/");
            }
            catch (e) {
                console.error(`Error deleting tracker ${value}:`, e);
            }
        }
    }

    useEffect(() => {
        getTrackers();
    }, [value]);

    useEffect(() => {
        setSlide(prev => {
            const next = { ...prev };
            let changed = false;
            for (const c of courses) {
                const dls = Array.isArray(deadlines[c.id]) ? deadlines[c.id] : [];
                const current = typeof prev[c.id] === "number" ? prev[c.id] : 0;
                const clamped = dls.length > 0 ? Math.max(0, Math.min(current, dls.length - 1)) : 0;
                if (current !== clamped) {
                    next[c.id] = clamped;
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [deadlines, courses]);

    useEffect(() => {
        function toDate (dlArr) {
            if (!Array.isArray(dlArr) || dlArr.length < 3) return null;
            return new Date(dlArr[2], dlArr[1] - 1, dlArr[0]);
        };

        Object.entries(deadlines).forEach(([course, dls]) => {
            dls.forEach(dl => {
                const currDue = toDate(dl.dlDue);
                const tdy = new Date();
                const diff = Math.ceil((currDue - tdy) / (1000 * 60 * 60 * 24));

                const isDone = !tasks[course].some(t =>
                    t.deadline === dl.name && !t.checked
                );

                if (diff < 0 && isDone) {
                    deleteDeadline(dl.id);
                }
            })
        })
    }, [tasks])

    if (value && valid) return (
        <>
            <button
                onClick={() => navigate("/")}
                className="absolute top-[2vw] left-[2vw] bg-blue-500 hover:bg-blue-700 flex items-center justify-center size-[max(40px,5vw)] rounded-full"
            >
                <img src="/back.png" alt="back" className="w-[2.3vw] h-[2.5vw]" />
            </button>

            <button
                onClick={createTracker}
                className="absolute top-[2vw] right-[2vw] flex items-center justify-center pb-[0.8vw] bg-teal-500 hover:bg-teal-700 size-[max(40px,5vw)] text-white text-[3.5vw] font-bold rounded-full"
            >
                +
            </button>

            <button
                onClick={deleteTracker}
                className="absolute top-[8vw] right-[2vw] flex items-center justify-center bg-red-500 hover:bg-red-700 size-[max(40px,5vw)] text-white text-[3.5vw] font-bold rounded-full"
            >
                <img src="/x.png" alt="x" className="size-[1.7vw]" />
            </button>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-x-[20px] gap-y-[30px] items-start m-[5vw]">
                {courses.length > 0 ? (
                    courses.map(c => {
                        const dls = Array.isArray(deadlines[c.id]) ? deadlines[c.id] : [];
                        const rawSlide = typeof slide[c.id] === "number" ? slide[c.id] : 0;
                        const safeSlide = dls.length > 0 ? Math.max(0, Math.min(rawSlide, dls.length - 1)) : 0;
                        if (edit[c.id]) {
                            return (
                                <EditCard
                                    key={c.id}
                                    course={c}
                                    deadlines={dls}
                                    tasks={Array.isArray(tasks[c.id]) ? tasks[c.id] : []}
                                    slide={safeSlide}
                                    setSlide={(newSlide) => setSlide(prev => ({
                                        ...prev,
                                        [c.id]: dls.length > 0 ? Math.max(0, Math.min(newSlide, dls.length - 1)) : 0
                                    }))}
                                    setEdit={setEdit}
                                    duplicateDl={duplicateDl}
                                    updateCourse={updateCourse}
                                    updateDlName={updateDlName}
                                    updateDlDue={updateDlDue}
                                    updateTodo={updateTodo}
                                    deleteCourse={deleteCourse}
                                    deleteDeadline={deleteDeadline}
                                    deleteTask={deleteTask}
                                    fetchAll={fetchAll}
                                />
                            );
                        }

                        return (
                            <CourseCard
                                key={c.id}
                                course={c}
                                deadlines={dls}
                                tasks={Array.isArray(tasks[c.id]) ? tasks[c.id] : []}
                                slide={safeSlide}
                                setSlide={(newSlide) => setSlide(prev => ({
                                    ...prev,
                                    [c.id]: dls.length > 0 ? Math.max(0, Math.min(newSlide, dls.length - 1)) : 0
                                }))}
                                updateChecked={updateChecked}
                                setEdit={setEdit}
                            />
                        );
                    })) : (
                        <h2 className="col-span-4 text-center text-[2vw] font-semibold"> Add a course to start! </h2>
                    )
                }
            </div>

            <div className="bg-slate-300 bg-opacity-70 flex flex-wrap mx-[5vw] mb-[3vw] rounded-xl">
                <CourseForm addCourse={addCourse} />
                <DeadlineForm addDeadline={addDeadline} courses={courses} />
                <TaskForm addTask={addTask} courses={courses} deadlines={deadlines} />
            </div>
        </>
    );

    return (
        <div className="flex flex-col items-center">
            {
                !valid ? (
                    <h2 className="text-[2vw] font-semibold m-[3vw]"> Whoops! Wrong id </h2>
                ) : (
                    <h2 className="text-[2vw] font-semibold m-[3vw]"> Add tracker to use </h2>
                )
            }

            <button
                onClick={() => createTracker()}
                className="flex items-center justify-center pb-[0.7vw] bg-teal-500 hover:bg-teal-700 size-[7vw] text-white text-[4vw] font-bold rounded-full"
            >
                +
            </button>

            <Instructions />
        </div>
    )
}