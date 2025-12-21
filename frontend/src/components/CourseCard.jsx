export default function CourseCard({ course, deadlines, tasks }) {
    return (
        <div className="bg-slate-300 border border-black rounded-md w-[20vw] h-[8vw] p-4">
            <h1> {course.name} ({course.credits} op) </h1>
        </div>
    );
}