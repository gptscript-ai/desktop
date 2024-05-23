import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loading() {
    return (
        <div className="flex flex-col justify-center items-center h-full space-y-10">
            <AiOutlineLoading3Quarters className="animate-spin text-8xl" />
            <h1 className="text-3xl">Loading your script now...</h1>
        </div>
    );
}