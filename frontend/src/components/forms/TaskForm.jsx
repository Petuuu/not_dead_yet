import { useState } from "react";

export default function TaskForm({ addTask, courses, deadlines }) {
    const [courseId, setCourseId] = useState(0);
    const [deadlineId, setDeadlineId] = useState(0);
    const [todo, setTodo] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        if (courseId > 0 && deadlineId > 0 && todo) {
            addTask(courseId, deadlineId, todo);
            setTodo("");
        }
    };

    return <>miu</>
}