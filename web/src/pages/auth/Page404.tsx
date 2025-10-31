import { Link } from 'react-router-dom';

import logo from '../../assets/brand/logo.png';
import { PATHS } from '../../routes/PathConstants';

const AuthPage404 = () => {
  return (
    <main className='w-screen h-screen flex flex-col gap-2 items-center justify-center'>
      <div className='shadow-xl border border-[rgba(0,0,0,0.25)] mb-4'>
        <img src={logo} alt='Pollara logo' className='w-20 rounded' />
      </div>

      <div className='text-2xl font-bold'>This page does not exist.</div>

      <p className='text-xl'>
        Return to&nbsp;
        <Link to={PATHS.AUTH.LOGIN} className='underline'>
          Login
        </Link>
      </p>
    </main>
  );
};

export default AuthPage404;
