import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import commonRoutes from './index.tsx';
import { PATHS } from './PathConstants';
const Logs = lazy(() => import('../pages/logs'));
const Parties = lazy(() => import('../pages/parties'));
const Elections = lazy(() => import('../pages/elections'));
const Contestants = lazy(() => import('../pages/contestants'));
const PartyAdd = lazy(() => import('../pages/parties/PartyAdd'));
const PartyUpdate = lazy(() => import('../pages/parties/PartyUpdate'));
const ElectionAdd = lazy(() => import('../pages/elections/ElectionAdd'));
const Dashboard = lazy(() => import('../pages/dashboard/DashboardAdmin'));
const ElectionUpdate = lazy(() => import('../pages/elections/ElectionUpdate'));
const ContestantAdd = lazy(() => import('../pages/contestants/ContestantAdd'));
const ContestantUpdate = lazy(() => import('../pages/contestants/ContestantUpdate'));
const ElectionContestants = lazy(() => import('../pages/elections/ElectionContestants'));

const { CONTESTANTS, DASHBOARD, ELECTIONS, LOGS, PARTIES } = PATHS;

const adminRoutes: RouteObject[] = [
  ...commonRoutes,
  { path: DASHBOARD, element: <Dashboard /> },
  { path: LOGS, element: <Logs /> },
  { path: PARTIES.ADD, element: <PartyAdd /> },
  { path: PARTIES.FETCH, element: <Parties /> },
  { path: PARTIES.EDIT, element: <PartyUpdate /> },
  { path: ELECTIONS.FETCH, element: <Elections /> },
  { path: ELECTIONS.ADD, element: <ElectionAdd /> },
  { path: CONTESTANTS.FETCH, element: <Contestants /> },
  { path: CONTESTANTS.ADD, element: <ContestantAdd /> },
  { path: ELECTIONS.EDIT, element: <ElectionUpdate /> },
  { path: CONTESTANTS.EDIT, element: <ContestantUpdate /> },
  { path: ELECTIONS.CONTESTANTS, element: <ElectionContestants /> },
];

export default adminRoutes;
