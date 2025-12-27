export default function Instructions() {
    return (
        <div className="bg-slate-300 bg-opacity-70 w-[70vw] m-[5vw] p-[2vw] rounded-xl">
            <h2 className="text-[2vw] font-bold"> Instructions </h2>

            <div className="mx-[2vw]">
                <h3 className="text-[1.4vw] mt-[1vw] font-semibold text-neutral-600"> Trackers </h3>

                <p className="text-[1.2vw] mx-[2vw] my-[1vw]">
                    Trackers are created by clicking the teal + button. Each tracker is identified by a unique, automatically
                    generated 16-character ID. You can access a tracker by appending this ID to the end of the URL, as shown below:
                </p>

                <code className="text-[1.2vw] ml-[2vw] pl-[2vw]"> https://not-dead-yet.vercel.app/*YOUR-ID-HERE* </code>

                <p className="text-[1.2vw] mx-[2vw] mt-[1vw] mb-[2vw]">
                    As this ID grants direct access to the tracker, it must be remembered and kept secure.
                </p>
            </div>

            <div className="mx-[2vw]">
                <h3 className="text-[1.4vw] mt-[1vw] font-semibold text-neutral-600"> Forms </h3>

                <p className="text-[1.2vw] mx-[2vw] my-[1vw]">
                    Start by entering the course name and number of credits. Next, add your deadlines, and finally create your tasks.
                </p>
            </div>
        </div>
    );
}