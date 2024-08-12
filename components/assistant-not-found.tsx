type NotFoundProps = {
    textSize?: string;
    spaceY?: string;
};

export default function AssistantNotFound({textSize, spaceY}: NotFoundProps) {
    return (
        <div className={`flex flex-col justify-center items-center h-full ${spaceY ? spaceY : 'space-y-10'}`}>
            <h1 className={`${textSize ? textSize : "text-3xl"}`}>Assistant not found...</h1>
        </div>
    );
}