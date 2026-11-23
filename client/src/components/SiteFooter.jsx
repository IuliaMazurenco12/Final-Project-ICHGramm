import { Link } from 'react-router-dom';
import styles from '../styles/Shell.module.css';

const FOOTER_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Search', action: 'search' },
  { label: 'Explore', to: '/explore' },
  { label: 'Messages', to: '/messages' },
  { label: 'Notifications', action: 'notifications' },
  { label: 'Create', action: 'create' },
];

const SiteFooter = ({ onOpenSearch, onOpenCreate }) => {
  const actionHandlers = {
    search: onOpenSearch,
    create: onOpenCreate,
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <nav className={styles.footerLinks}>
        {FOOTER_ITEMS.map((item) =>
          item.to ? (
            <Link key={item.label} to={item.to} className={styles.footerLink}>
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              className={styles.footerLink}
              onClick={actionHandlers[item.action]}
            >
              {item.label}
            </button>
          )
        )}
      </nav>

      <p className={styles.copyright}>© {currentYear} ICHgram</p>
    </footer>
  );
};

export default SiteFooter;