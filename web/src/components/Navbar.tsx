import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Chip, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { MenuRounded, MenuOpenRounded, MoreVert, Notifications } from '@mui/icons-material';

import logo from '../assets/brand/logo.png';
import { PATHS } from '../routes/PathConstants';
import { useLogoutMutation } from '../services/apis/authApi';
import { Overlay, ThemeToggle, LinkButton, LinkIconButton } from './index';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess, useAppSelector } from '../hooks';

enum RoleWeight {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

/**
 * Only 1 or none of `allowedRoles` and `restrictedRoles` is allowed to be present in a `NavLink` object.
 * However, if both are present then `restrictedRoles` is given priority over `allowedRoles`
 */
interface NavLink {
  url: string;
  text: string;
  urlRegex: RegExp;
  allowedRoles?: RoleWeight | RoleWeight[];
  restrictedRoles?: RoleWeight | RoleWeight[];
}
const {
  LOGS,
  USERS,
  VOTES,
  FORMS,
  TOKENS,
  PARTIES,
  RESULTS,
  ELECTIONS,
  DASHBOARD,
  CONTESTANTS,
  NOTIFICATIONS,
  PRIVACY_POLICY,
  FACE_ID_REGISTER,
  AUTH: { LOGIN, REGISTER_USER },
} = PATHS;

const navLinks: NavLink[] = [
  {
    text: 'Dashboard',
    url: DASHBOARD,
    urlRegex: new RegExp(`^${DASHBOARD}$`),
  },
  {
    text: 'Users',
    url: USERS,
    urlRegex: new RegExp(`^${USERS}\/?`),
    allowedRoles: RoleWeight.SUPER_ADMIN,
  },
  {
    text: 'Tokens',
    url: TOKENS,
    urlRegex: new RegExp(`^${TOKENS}\/?`),
    allowedRoles: RoleWeight.SUPER_ADMIN,
  },
  {
    text: 'Elections',
    url: ELECTIONS.FETCH,
    urlRegex: new RegExp(`^${ELECTIONS.FETCH}\/?`),
  },
  {
    text: 'Forms',
    url: FORMS.FETCH,
    urlRegex: new RegExp(`^${FORMS.FETCH}\/?`),
  },
  {
    text: 'My Forms',
    url: FORMS.USER,
    urlRegex: new RegExp(`^${FORMS.USER}\/?`),
  },
  {
    text: 'Election Results',
    url: RESULTS.ELECTION.FETCH,
    urlRegex: new RegExp(`^${RESULTS.ELECTION.FETCH}\/?`),
  },
  {
    text: 'Form Results',
    url: RESULTS.FORM.FETCH,
    urlRegex: new RegExp(`^${RESULTS.FORM.FETCH}\/?`),
  },
  {
    text: 'Verify Election Vote',
    url: VOTES.ELECTION.VERIFY,
    urlRegex: new RegExp(`^${VOTES.ELECTION.VERIFY}\/?`),
    allowedRoles: RoleWeight.USER,
  },
  {
    text: 'Verify Form Vote',
    url: VOTES.FORM.VERIFY,
    urlRegex: new RegExp(`^${VOTES.FORM.VERIFY}\/?`),
  },
  {
    text: 'Contestants',
    url: CONTESTANTS.FETCH,
    urlRegex: new RegExp(`^${CONTESTANTS.FETCH}\/?`),
    restrictedRoles: RoleWeight.USER,
  },
  {
    text: 'Parties',
    url: PARTIES.FETCH,
    urlRegex: new RegExp(`^${PARTIES.FETCH}\/?`),
    restrictedRoles: RoleWeight.USER,
  },
  {
    text: 'Logs',
    url: LOGS,
    urlRegex: new RegExp(`^${LOGS}\/?`),
    restrictedRoles: RoleWeight.USER,
  },
  { text: 'Privacy Policy', url: PRIVACY_POLICY, urlRegex: new RegExp(`^${PRIVACY_POLICY}\/?`) },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const {
    isAuthenticated,
    currentUser: { lastName, role },
  } = useAppSelector(state => state.authStore);

  const navLinkFilter = useCallback(({ url, allowedRoles, restrictedRoles }: NavLink) => {
    if (!isAuthenticated) {
      // @ts-ignore
      return [VOTES.FORM.VERIFY, PRIVACY_POLICY].includes(url);
    } else if (restrictedRoles !== undefined) {
      return Array.isArray(restrictedRoles)
        ? !restrictedRoles.includes(RoleWeight[role])
        : restrictedRoles !== RoleWeight[role];
    } else if (allowedRoles !== undefined) {
      return Array.isArray(allowedRoles)
        ? allowedRoles.includes(RoleWeight[role])
        : allowedRoles === RoleWeight[role];
    }

    return true;
  }, []);

  const filteredNavLinks = useMemo(() => navLinks.filter(navLinkFilter), [navLinks]);

  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const matchesPhone = useMediaQuery('(max-width:640px)');
  const matchesTablet = useMediaQuery('(max-width:800px)');
  const matchesLaptop = useMediaQuery('(max-width:1900px)');
  const maxNavLinks = useMemo(() => {
    if (matchesPhone) return filteredNavLinks.length;
    if (matchesTablet) return 3;
    else if (matchesLaptop) return 5;

    return filteredNavLinks.length;
  }, [filteredNavLinks, matchesLaptop, matchesTablet, matchesPhone]);

  const [logout, { error, isError, isLoading, isSuccess, data }] = useLogoutMutation();

  const toggleNav = useCallback(() => setMenuOpened(opened => !opened), []);

  const toggleShowMore = useCallback(() => setShowMore(show => !show), []);

  const handleLogout = async () => {
    await logout();
    navigate(LOGIN);
  };

  const handleNavLinkClick = () => {
    toggleNav();
    toggleShowMore();
  };

  useHandleReduxQueryError({ error, isError });
  useHandleReduxQuerySuccess({ isSuccess, response: data });

  return (
    <nav className='bg-white -mx-4 px-4 h-16 mb-5 py-3 flex gap-5 items-center justify-between border-b sticky top-0 z-1200 sm:-mx-8 sm:px-8'>
      <IconButton onClick={toggleNav} aria-label='menu-hamburger' className='sm:!hidden'>
        {menuOpened ? <MenuOpenRounded /> : <MenuRounded />}
      </IconButton>

      <Link to={DASHBOARD} className='hidden items-center gap-2 sm:flex'>
        <img src={logo} alt='Pollara Logo' className='w-8 rounded' />
      </Link>

      <div
        className={`nav-links flex gap-5 bg-white top-16 max-sm:w-screen max-sm:h-[calc(100dvh-64px)] max-sm:fixed max-sm:flex-col max-sm:overflow-y-auto max-sm:p-4 transition-[inset] duration-500 ${
          menuOpened ? 'right-0' : 'right-full'
        }`}
      >
        <Link
          to={DASHBOARD}
          onClick={toggleNav}
          className='flex items-center gap-2 w-fit sm:hidden'
        >
          <img src={logo} alt='Pollara Logo' className='size-10' />
          <span className='font-medium'>Pollara</span>
        </Link>
        {filteredNavLinks.slice(0, maxNavLinks).map(({ text, url, urlRegex }) => (
          <Link
            to={url}
            key={text}
            onClick={toggleNav}
            className={`nav-link ${urlRegex.test(pathname) && 'selected'}`}
          >
            {text}
          </Link>
        ))}
        {filteredNavLinks.length > maxNavLinks && (
          <div className='relative'>
            <Tooltip title='More'>
              <IconButton
                id='more'
                aria-label='more'
                onClick={toggleShowMore}
                className='h-[30.7px] w-[30.7px] cursor-pointer'
              >
                <MoreVert />
              </IconButton>
            </Tooltip>

            <div
              className={`border border-[rgba(0,0,0,0.2)] shadow-lg nav-links flex flex-col gap-2 p-2 rounded bg-white absolute top-[calc(100%+5px)] right-3 z-60 duration-300 ${
                showMore || 'opacity-0 invisible'
              }`}
            >
              {filteredNavLinks.slice(maxNavLinks).map(({ text, url, urlRegex }) => (
                <Link
                  to={url}
                  key={text}
                  onClick={handleNavLinkClick}
                  className={`nav-link h-[30.7px] text-center !w-full ${
                    urlRegex.test(pathname) && 'selected'
                  }`}
                >
                  {text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ThemeToggle />

      {isAuthenticated && (
        <Tooltip title='Notifications'>
          <LinkIconButton to={NOTIFICATIONS} className='size-9' aria-label='notifications'>
            <Notifications className='text-primary-700' />
          </LinkIconButton>
        </Tooltip>
      )}

      <Overlay visible={showMore} onClick={toggleShowMore} extraClassNames='bg-transparent' />

      {isAuthenticated ? (
        <div className='dropdown'>
          <Chip
            label={lastName}
            component='button'
            variant='outlined'
            onClick={() => {}}
            avatar={<Avatar alt={lastName} src='' />}
          />
          <div className='content'>
            <LinkButton to={FACE_ID_REGISTER} size='small'>
              Face ID
            </LinkButton>
            <Button size='small' onClick={handleLogout} disabled={isLoading}>
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex gap-3'>
          <LinkButton to={REGISTER_USER} variant='outlined' className='max-[400px]:!hidden'>
            Sign up
          </LinkButton>
          <LinkButton to={LOGIN} variant='contained'>
            Login
          </LinkButton>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
