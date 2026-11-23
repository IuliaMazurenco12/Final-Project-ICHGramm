import { useCallback, useEffect, useState } from 'react';
import httpClient from '../api/httpClient';
import DimLayer from '../components/DimLayer';
import PublicationView from '../components/PublicationView';
import styles from '../styles/Explore.module.css';

const pickTileClass = (index) => {
  const position = index % 10;
  if (position === 2) return `${styles.tile} ${styles.tileTallRight}`;
  if (position === 5) return `${styles.tile} ${styles.tileTallLeft}`;
  return styles.tile;
};

const Explore = () => {
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const selectedPublication = publications.find((publication) => publication._id === selectedId);

  useEffect(() => {
    let isActive = true;

    const loadExplore = async () => {
      try {
        const { data } = await httpClient.get('/publications/explore');
        if (isActive) setPublications(data.publications);
      } catch (error) {
        if (isActive) {
          setErrorText(error.response?.data?.message || 'Could not load publications.');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadExplore();

    return () => {
      isActive = false;
    };
  }, []);

  const closeViewer = useCallback(() => setSelectedId(null), []);

  const handlePublicationUpdated = (updated) => {
    setPublications((prev) =>
      prev.map((publication) => (publication._id === updated._id ? updated : publication))
    );
  };

  const handlePublicationDeleted = (deletedId) => {
    setPublications((prev) => prev.filter((publication) => publication._id !== deletedId));
    setSelectedId(null);
  };

  if (isLoading) return <p className={styles.status}>Loading...</p>;
  if (errorText) return <p className={styles.status}>{errorText}</p>;
  if (publications.length === 0) return <p className={styles.status}>No publications yet</p>;

  return (
    <section className={styles.page}>
      <div className={styles.grid}>
        {publications.map((publication, index) => (
          <button
            key={publication._id}
            type="button"
            className={pickTileClass(index)}
            onClick={() => setSelectedId(publication._id)}
            aria-label={publication.caption || `Publication by ${publication.author.username}`}
          >
            <img src={publication.image} alt="" className={styles.tileImage} loading="lazy" />
          </button>
        ))}
      </div>

      {selectedPublication && (
        <DimLayer onClose={closeViewer}>
          <PublicationView
            key={selectedPublication._id}
            publication={selectedPublication}
            onUpdated={handlePublicationUpdated}
            onDeleted={handlePublicationDeleted}
          />
        </DimLayer>
      )}
    </section>
  );
};

export default Explore;