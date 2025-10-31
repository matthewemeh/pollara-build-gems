import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import adminRoutes from './admin.tsx';
import { PATHS } from './PathConstants';
const Users = lazy(() => import('../pages/users'));
const Tokens = lazy(() => import('../pages/tokens'));

const { TOKENS, USERS } = PATHS;

const superAdminRoutes: RouteObject[] = [
  ...adminRoutes,
  { path: USERS, element: <Users /> },
  { path: TOKENS, element: <Tokens /> },
];

export default superAdminRoutes;
