export default function Instructions() {
    return (
        <div className="bg-slate-300 bg-opacity-70 w-[70vw] h-[20vw] m-[5vw] p-[2vw] rounded-xl">
            <h2 className="text-[2vw] font-bold"> Instructions </h2>

            <p className="text-[1.2vw] mx-[2vw] mt-[2vw] mb-[1vw]">
                Trackers are created by clicking the teal + button. Each tracker is identified by a unique, automatically
                generated 32-character ID. You can access a tracker by appending this ID to the end of the URL, as shown below:
            </p>

            <code className="text-[1.2vw] ml-[2vw] pl-[2vw]"> https://not-dead-yet.vercel.app/*YOUR-ID-HERE* </code>

            <p className="text-[1.2vw] mx-[2vw] mt-[1vw] mb-[2vw]">
                As this ID grants direct access to the tracker, it must be remembered and kept secure.
            </p>
        </div>
    );
}