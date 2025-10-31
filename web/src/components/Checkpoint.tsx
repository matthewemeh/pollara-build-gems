import { FaRegCircleCheck } from 'react-icons/fa6';

interface Props {
  title: string;
  subtitle: string;
  completed?: boolean;
}

const Checkpoint: React.FC<Props> = ({ completed, subtitle, title }) => {
  return (
    <div
      className={`grid gap-x-2 grid-rows-[32px_32px] grid-cols-[32px_minmax(0,1fr)] duration-500 ${
        completed || 'opacity-30'
      }`}
    >
      <FaRegCircleCheck
        className={`size-7 mt-1.5 row-start-1 row-end-3 ${completed && 'text-primary-700'}`}
      />
      <p className='font-semibold text-xl'>{title}</p>
      <p>{subtitle}</p>
    </div>
  );
};

export default Checkpoint;
