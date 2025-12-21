import { useState } from "react";

export default function DeadlineSlides({ deadlines }) {
    const [slide, setSlide] = useState(0);

    function prevSlide() {
        setSlide((prev => prev == 0 ? 0 : prev - 1));
    };

    function nextSlide() {
        setSlide((prev => prev == deadlines.length - 1 ? deadlines.length - 1 : prev + 1));
    };

    return (
        <div className="relative">
            <div className="w-full h-[8vw] flex flex-col items-center justify-center bg-slate-400 rounded">
                <h1 className="text-lg font-bold"> {deadlines[slide].name} </h1>
                <p> {deadlines[slide].due} </p>
            </div>

            <button
                onClick={prevSlide}
                className="absolute size-[2.5vw] left-4 top-1/2 -translate-y-1/2 bg-slate-500 text-slate-100 p-2 rounded-full"
            >
                &#8592;
            </button>

            <button
                onClick={nextSlide}
                className="absolute size-[2.5vw] right-4 top-1/2 -translate-y-1/2 bg-slate-500 text-slate-100 p-2 rounded-full"
            >
                &#8594;
            </button>
        </div>
  );
}