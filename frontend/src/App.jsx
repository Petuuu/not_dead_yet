import { Routes, Route } from "react-router-dom";
import Courses from "./components/Courses";

export default function App() {
    return (
        <>
            <h1 className="text-[clamp(30px,4vw,60px)] font-bold m-[3vw] text-center"> Not Dead Yet </h1>

            <Routes>
                <Route path="/" element={<Courses />} />
                <Route path="/:id" element={<Courses />} />
            </Routes>

    </>
  );
}
