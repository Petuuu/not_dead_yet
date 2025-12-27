import { Routes, Route } from "react-router-dom";
import Courses from "./components/Courses";

export default function App() {
    return (
        <>
            <h1 className="text-[4vw] font-bold m-[3vw] text-center"> Not Dead Yet </h1>

            <Routes>
                <Route path="/" element={<Courses />} />
                <Route path="/:id" element={<Courses />} />
            </Routes>

    </>
  );
}
