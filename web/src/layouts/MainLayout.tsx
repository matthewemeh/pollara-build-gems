import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../hooks';
import { PATHS } from '../routes/PathConstants';
import { Navbar, Loading } from '../components';
import { Stage as UserStage } from '../pages/auth/register/RegisterUser';
import { Stage as AdminStage } from '../pages/auth/register/RegisterAdmin';

const { REGISTER_ADMIN, REGISTER_USER } = PATHS.AUTH;

const MainLayout = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    currentUser: { emailVerified, role },
  } = useAppSelector(state => state.authStore);

  useEffect(() => {
    if (isAuthenticated && !emailVerified) {
      if (role === 'USER') {
        navigate({ pathname: REGISTER_USER, search: `?stage=${UserStage.OTP}` });
      } else {
        navigate({ pathname: REGISTER_ADMIN, search: `?stage=${AdminStage.OTP}` });
      }
    }
  }, [emailVerified, isAuthenticated]);

  return (
    <div className='overflow-x-hidden min-h-screen px-4 sm:px-8'>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default MainLayout;
