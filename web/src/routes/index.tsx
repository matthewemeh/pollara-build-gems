import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { PATHS } from './PathConstants';
const Home = lazy(() => import('../pages/Home'));
const Forms = lazy(() => import('../pages/forms'));
const ElectionVotes = lazy(() => import('../pages/votes'));
const FormAdd = lazy(() => import('../pages/forms/FormAdd'));
const ElectionResults = lazy(() => import('../pages/results'));
const FormFill = lazy(() => import('../pages/forms/FormFill'));
const FormVotes = lazy(() => import('../pages/votes/FormVotes'));
const UserForms = lazy(() => import('../pages/forms/UserForms'));
const FaceRegister = lazy(() => import('../pages/FaceRegister'));
const FormUpdate = lazy(() => import('../pages/forms/FormUpdate'));
const Notifications = lazy(() => import('../pages/notifications'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const FormPreview = lazy(() => import('../pages/forms/FormPreview'));
const FormResult = lazy(() => import('../pages/results/FormResult'));
const FormResults = lazy(() => import('../pages/results/FormResults'));
const FormPopulate = lazy(() => import('../pages/forms/FormPopulate'));
const VerifyFormVote = lazy(() => import('../pages/votes/VerifyFormVote'));
const ElectionResult = lazy(() => import('../pages/results/ElectionResult'));

const { HOME, FACE_ID_REGISTER, FORMS, NOTIFICATIONS, VOTES, RESULTS, PRIVACY_POLICY } = PATHS;

const commonRoutes: RouteObject[] = [
  { path: HOME, element: <Home />, index: true },
  { path: FORMS.FETCH, element: <Forms /> },
  { path: FORMS.ADD, element: <FormAdd /> },
  { path: FORMS.FILL, element: <FormFill /> },
  { path: FORMS.USER, element: <UserForms /> },
  { path: FORMS.EDIT, element: <FormUpdate /> },
  { path: FORMS.PREVIEW, element: <FormPreview /> },
  { path: VOTES.FORM.FETCH, element: <FormVotes /> },
  { path: NOTIFICATIONS, element: <Notifications /> },
  { path: FORMS.POPULATE, element: <FormPopulate /> },
  { path: PRIVACY_POLICY, element: <PrivacyPolicy /> },
  { path: FACE_ID_REGISTER, element: <FaceRegister /> },
  { path: RESULTS.FORM.RESULT, element: <FormResult /> },
  { path: RESULTS.FORM.FETCH, element: <FormResults /> },
  { path: VOTES.FORM.VERIFY, element: <VerifyFormVote /> },
  { path: VOTES.ELECTION.FETCH, element: <ElectionVotes /> },
  { path: RESULTS.ELECTION.RESULT, element: <ElectionResult /> },
  { path: RESULTS.ELECTION.FETCH, element: <ElectionResults /> },
];

export default commonRoutes;
