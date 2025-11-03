import { Link } from 'react-router-dom';

import Checkpoint from './Checkpoint';
import { PATHS } from '../routes/PathConstants';

interface Props {
  currentStep: number;
  checkpoints: Checkpoint[];
}

const StepTracker: React.FC<Props> = ({ checkpoints, currentStep }) => {
  const { DASHBOARD } = PATHS;

  return (
    <aside className='step-tracker pt-8 bg-alabaster flex-col gap-5 hidden px-8 md:flex'>
      <Link to={DASHBOARD} className='mb-4 w-fit flex gap-2 items-center'>
        <img
          loading='eager'
          alt='Pollara logo'
          className='size-8'
          src='/web-app-manifest-512x512.png'
        />
        <span className='text-2xl font-bold'>Pollara</span>
      </Link>
      {checkpoints.map(({ subtitle, title }, index) => (
        <Checkpoint
          key={index}
          title={title}
          subtitle={subtitle}
          completed={index <= currentStep}
        />
      ))}
    </aside>
  );
};

export default StepTracker;
