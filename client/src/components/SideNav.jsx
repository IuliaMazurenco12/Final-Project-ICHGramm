import { Link, NavLink, useLocation } from 'react-router-dom';
import { GoHome, GoHomeFill } from 'react-icons/go';
import { IoSearchOutline, IoSearch, IoHeartOutline } from 'react-icons/io5';
import { MdOutlineExplore, MdExplore } from 'react-icons/md';
import { PiMessengerLogo, PiMessengerLogoFill } from 'react-icons/pi';
import { BsPlusSquare } from 'react-icons/bs';
import { useCurrentUser } from '../context/CurrentUserContext';
import AvatarBadge from './AvatarBadge';
import logo from '../assets/logo.svg';
import styles from '../styles/Shell.module.css';

const ICON_SIZE = 24;

const MENU_ITEMS = [
  { label: 'Home', to: '/', Icon: GoHome, ActiveIcon: GoHomeFill },
  { label: 'Search', action: 'search', Icon: IoSearchOutline, ActiveIcon: IoSearch },
  { label: 'Explore', to: '/explore', Icon: MdOutlineExplore, ActiveIcon: MdExplore },
  { label: 'Messages', to: '/messages', Icon: PiMessengerLogo, ActiveIcon: PiMessengerLogoFill },
  { label: 'Notifications', action: 'notifications', Icon: IoHeartOutline },
  { label: 'Create', action: 'create', Icon: BsPlusSquare },
];

const pickItemClass = (isActive) =>
  isActive ? `${styles.menuItem} ${styles.menuItemActive}` : styles.menuItem;

const SideNav = ({ isSearchOpen, onOpenSearch, onOpenCreate, onNavigate }) => {
  const { currentUser } = useCurrentUser();
  const { pathname } = useLocation();

  const ownProfilePath = `/profile/${currentUser._id}`;
  const isProfileActive =
    !isSearchOpen && (pathname === ownProfilePath || pathname === '/profile/edit');

  const actionHandlers = {
    search: onOpenSearch,
    create: onOpenCreate,
  };

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logoLink} onClick={onNavigate}>
        <img src={logo} alt="ICHGRAM" className={styles.logo} />
      </Link>

      <nav className={styles.menu}>
        {MENU_ITEMS.map((item) => {
          if (item.to) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) => pickItemClass(isActive && !isSearchOpen)}
              >
                {({ isActive }) => {
                  const active = isActive && !isSearchOpen;
                  const Icon = active ? item.ActiveIcon : item.Icon;
                  return (
                    <>
                      <Icon size={ICON_SIZE} />
                      <span>{item.label}</span>
                    </>
                  );
                }}
              </NavLink>
            );
          }

          const active = item.action === 'search' && isSearchOpen;
          const Icon = active ? item.ActiveIcon : item.Icon;

          return (
            <button
              key={item.label}
              type="button"
              className={pickItemClass(active)}
              onClick={actionHandlers[item.action]}
            >
              <Icon size={ICON_SIZE} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <NavLink
          to={ownProfilePath}
          onClick={onNavigate}
          className={() => `${pickItemClass(isProfileActive)} ${styles.profileItem}`}
        >
          <AvatarBadge src={currentUser.avatar} size={ICON_SIZE} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default SideNav;