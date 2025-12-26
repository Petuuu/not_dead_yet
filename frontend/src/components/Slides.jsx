export default function DeadlineSlides({ deadlines, slide, setSlide }) {
    function prevSlide() {
        const newSlide = slide === 0 ? 0 : slide - 1;
        setSlide(newSlide);
    };

    function nextSlide() {
        const len = deadlines.length;
        const newSlide = slide === len - 1 ? len - 1 : slide + 1;
        setSlide(newSlide);
    };

    return (
        <div className="relative">
            <div className="w-full h-[6vw] flex flex-col items-center justify-center bg-slate-400 rounded">
                <h1 className="text-lg font-bold"> {deadlines[slide].name} </h1>
                <p className="text-sm"> Deadline {slide + 1} of {deadlines.length} </p>
            </div>

            <button
                onClick={prevSlide}
                className="absolute size-[2.5vw] left-[0.8vw] top-1/2 -translate-y-1/2 bg-slate-500 text-slate-100 rounded-full"
            >
                &#8592;
            </button>

            <button
                onClick={nextSlide}
                className="absolute size-[2.5vw] right-[0.8vw] top-1/2 -translate-y-1/2 bg-slate-500 text-slate-100 rounded-full"
            >
                &#8594;
            </button>
        </div>
  );
}