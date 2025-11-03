import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import commonRoutes from './index.tsx';
import { PATHS } from './PathConstants';
const UserElections = lazy(() => import('../pages/user-elections'));
const Election = lazy(() => import('../pages/user-elections/Election'));
const Dashboard = lazy(() => import('../pages/dashboard/DashboardUser'));
const VerifyElectionVote = lazy(() => import('../pages/votes/VerifyElectionVote'));

const { DASHBOARD, ELECTIONS, VOTES } = PATHS;

const userRoutes: RouteObject[] = [
  ...commonRoutes,
  { path: DASHBOARD, element: <Dashboard /> },
  { path: ELECTIONS.ELECTION, element: <Election /> },
  { path: ELECTIONS.FETCH, element: <UserElections /> },
  { path: VOTES.ELECTION.VERIFY, element: <VerifyElectionVote /> },
];

export default userRoutes;
