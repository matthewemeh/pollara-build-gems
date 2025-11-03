import { Link, useLocation } from 'react-router-dom';

import { PATHS } from '../routes/PathConstants';

const Banner = () => {
  const { pathname } = useLocation();

  return (
    <aside
      className={`banner pt-8 bg-gradient-to-tr from-primary-500 to-primary-800 items-center justify-center flex-col gap-5 hidden px-8 ${
        !pathname.includes('register') && 'md:flex'
      }`}
    >
      <Link to={PATHS.HOME} className='mb-4 w-fit flex flex-col gap-2 items-center'>
        <img
          loading='eager'
          alt='Pollara logo'
          className='w-20 rounded-md'
          src='/web-app-manifest-512x512.png'
        />
        <span className='text-2xl font-bold text-white'>Pollara</span>
      </Link>
    </aside>
  );
};

export default Banner;
