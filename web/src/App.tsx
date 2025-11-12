import { useEffect, useMemo } from 'react';
import { RouterProvider, createBrowserRouter, type RouteObject } from 'react-router-dom';

import { authRoutes } from './routes';
import { useAppSelector } from './hooks';
import MainPage404 from './pages/Page404';
import * as userRoutes from './routes/user';
import * as adminRoutes from './routes/admin';
import AuthPage404 from './pages/auth/Page404';
import AppProvider from './contexts/AppContext';
import * as superAdminRoutes from './routes/superAdmin';
import { AuthLayout, MainLayout, MuiLayout } from './layouts';

const App = () => {
  const { prefersDarkMode, currentUser } = useAppSelector(state => state.authStore);

  useEffect(() => {
    document.body.setAttribute('data-theme', prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const getRoutesFrom = (routeModules: Record<string, RouteObject[]>): RouteObject[] =>
    Object.values(routeModules).flat();

  const routes: RouteObject[] = useMemo(() => {
    if (currentUser.role === 'USER') {
      return getRoutesFrom(userRoutes);
    } else if (currentUser.role === 'ADMIN') {
      return getRoutesFrom(adminRoutes);
    } else {
      return getRoutesFrom(superAdminRoutes);
    }
  }, [currentUser.role]);

  const router = createBrowserRouter([
    {
      children: routes,
      element: <MainLayout />,
      errorElement: <MainPage404 />,
    },
    {
      children: authRoutes,
      element: <AuthLayout />,
      errorElement: <AuthPage404 />,
    },
  ]);

  return (
    <MuiLayout>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </MuiLayout>
  );
};

export default App;
