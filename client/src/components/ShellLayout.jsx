import { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import SiteFooter from './SiteFooter';
import CreatePublicationModal from './CreatePublicationModal';
import SearchPanel from './SearchPanel';
import styles from '../styles/Shell.module.css';

const ShellLayout = () => {
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [feedVersion, setFeedVersion] = useState(0);

  const toggleSearch = () => setIsSearchOpen((open) => !open);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const openCreate = () => {
    setIsSearchOpen(false);
    setIsCreateOpen(true);
  };
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const handlePublicationCreated = () => {
    setIsCreateOpen(false);
    setFeedVersion((version) => version + 1);
    navigate('/');
  };

  return (
    <div className={styles.shell}>
      <div className={styles.workspace}>
        <SideNav
          isSearchOpen={isSearchOpen}
          onOpenSearch={toggleSearch}
          onOpenCreate={openCreate}
          onNavigate={closeSearch}
        />

        <main className={styles.content}>
          <Outlet context={{ feedVersion }} />
        </main>
      </div>

      <SiteFooter onOpenSearch={toggleSearch} onOpenCreate={openCreate} />

      {isSearchOpen && <SearchPanel onClose={closeSearch} />}

      {isCreateOpen && (
        <CreatePublicationModal onClose={closeCreate} onCreated={handlePublicationCreated} />
      )}
    </div>
  );
};

export default ShellLayout;