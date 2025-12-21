export default function CourseCard({ course }) {
    return (
        <div className="border border-black rounded-md w-[20vw] h-[8vw] p-4">
            <p>{course.name} ({course.credits} op)</p>
        </div>
    );
}