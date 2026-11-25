import { useEffect, useState } from 'react';
import httpClient from '../api/httpClient';
import PublicationCard from '../components/PublicationCard';
import caughtUpIcon from '../assets/logo_footer.svg';
import styles from '../styles/Feed.module.css';

const CaughtUpBadge = () => (
  <div className={styles.caughtUp}>
    <img src={caughtUpIcon} alt="" width="83" height="83" className={styles.caughtUpIcon} />
    <p className={styles.caughtUpTitle}>You've seen all the updates</p>
    <p className={styles.caughtUpText}>You have viewed all new publications</p>
  </div>
);

const Home = () => {
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      try {
        const { data } = await httpClient.get('/publications');
        if (isActive) setPublications(data.publications);
      } catch (error) {
        if (isActive) {
          setErrorText(error.response?.data?.message || 'Could not load publications.');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadFeed();

    return () => {
      isActive = false;
    };
  }, []);

  const handleFollowed = (authorId) => {
    setPublications((prev) =>
      prev.map((publication) =>
        publication.author._id === authorId
          ? { ...publication, authorFollowedByMe: true }
          : publication
      )
    );
  };

  if (isLoading) {
    return <p className={styles.status}>Loading...</p>;
  }

  if (errorText) {
    return <p className={styles.status}>{errorText}</p>;
  }

  if (publications.length === 0) {
    return (
      <div className={styles.status}>
        <p className={styles.emptyTitle}>No publications yet</p>
        <p>Press Create in the menu to share your first photo.</p>
      </div>
    );
  }

  return (
    <section className={styles.feed}>
      <div className={styles.grid}>
        {publications.map((publication) => (
          <PublicationCard
            key={publication._id}
            publication={publication}
            onFollowed={handleFollowed}
          />
        ))}
      </div>

      <CaughtUpBadge />
    </section>
  );
};

export default Home;