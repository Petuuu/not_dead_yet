export default function Slides({
    courseId,
    deadlines,
    slide,
    setSlide,
    edit = false,
    localDlName = {},
    setLocalDlName = {}
}) {
    const curr = deadlines[slide];

    function nextSlide() {
        const len = deadlines.length;
        setSlide(slide === len - 1 ? len - 1 : slide + 1);
    };

    return (
        <div className="relative">
            <div className="w-full h-[90px] flex flex-col items-center justify-center bg-slate-400 rounded">
                <h1 className="text-lg font-bold">
                    {edit ? (
                        <input
                            id={curr.id}
                            value={localDlName[curr.id] ?? curr.name}
                            onChange={e => setLocalDlName(prev => ({ ...prev, [curr.id]: e.target.value }))}
                            autoComplete="off"
                            className={"bg-inherit mr-[0.5vw] mb-[0.2vw] pb-[0.2vw] w-[11vw] text-center border-b-[0.13vw] border-neutral-500 outline-none"}
                        />
                    ) : (
                        <p> {curr.name} </p>
                    )}
                </h1>

                <p className="text-sm"> Deadline {slide + 1} of {deadlines.length} </p>
            </div>

            <button
                onClick={e => setSlide(slide === 0 ? 0 : slide - 1)}
                className="absolute size-[40px] left-[0.8vw] top-1/2 -translate-y-1/2 bg-slate-500 text-slate-100 rounded-full"
            >
                &#8592;
            </button>

            <button
                onClick={nextSlide}
                className="absolute size-[40px] right-[0.8vw] top-1/2 -translate-y-1/2 bg-slate-500 text-slate-100 rounded-full"
            >
                &#8594;
            </button>
        </div>
  );
}