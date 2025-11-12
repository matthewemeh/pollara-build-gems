import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { PATHS } from '../routes/PathConstants';
import { Navbar, Loading } from '../components';
import { logout } from '../services/apis/authApi/store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Stage as UserStage } from '../pages/auth/register/RegisterUser';
import { Stage as AdminStage } from '../pages/auth/register/RegisterAdmin';

const { LOGIN, REGISTER_ADMIN, REGISTER_USER } = PATHS.AUTH;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();
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

  useEffect(() => {
    if (isAuthenticated) return;

    const unprotectedPaths = [
      /^\/$/, // home page
      /^\/privacy\/?/,
      /^\/auth(?:\/.*)?$/,
      /^\/forms\/fill\/?/,
      /^\/verify-vote\/form\/?/,
      /^\/results\/form\/[a-f0-9]{24}\/?$/,
    ];

    if (unprotectedPaths.some(r => r.test(pathname))) return;

    dispatch(logout());
    // Save intent and redirect to login
    const externalIntent = encodeURIComponent(pathname + search);
    externalIntent
      ? navigate({ pathname: LOGIN, search: `?external-intent=${externalIntent}` })
      : navigate(LOGIN);
  }, [pathname, search, isAuthenticated]);

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
