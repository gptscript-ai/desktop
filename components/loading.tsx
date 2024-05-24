import { AiOutlineLoading3Quarters } from "react-icons/ai";

type LoadingProps = {
    children?: React.ReactNode;
};

export default function Loading({ children }: LoadingProps) {
    return (
        <div className="flex flex-col justify-center items-center h-full space-y-10">
            <AiOutlineLoading3Quarters className="animate-spin text-8xl" />
            <h1 className="text-3xl">{children}</h1>
        </div>
    );
}