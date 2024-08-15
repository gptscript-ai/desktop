import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type LoadingProps = {
  children?: React.ReactNode;
  wheelSize?: string;
  textSize?: string;
  spaceY?: string;
};

export default function Loading({
  children,
  wheelSize,
  textSize,
  spaceY,
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center h-full ${spaceY ? spaceY : 'space-y-10'}`}
    >
      <AiOutlineLoading3Quarters
        className={`animate-spin ${wheelSize ? wheelSize : 'text-8xl'}`}
      />
      <h1 className={`${textSize ? textSize : 'text-3xl'}`}>{children}</h1>
    </div>
  );
}
