import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import httpClient from '../api/httpClient';
import { useCurrentUser } from '../context/CurrentUserContext';
import PublicationView from '../components/PublicationView';
import styles from '../styles/PostPage.module.css';

const PostContent = ({ publicationId }) => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [publication, setPublication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadPublication = async () => {
      try {
        const { data } = await httpClient.get(`/publications/${publicationId}`);
        if (isActive) setPublication(data.publication);
      } catch (error) {
        if (!isActive) return;
        const status = error.response?.status;
        setErrorText(
          status === 404 || status === 400
            ? 'This publication does not exist.'
            : error.response?.data?.message || 'Could not load the publication.'
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadPublication();

    return () => {
      isActive = false;
    };
  }, [publicationId]);

  const handleDeleted = () => {
    navigate(`/profile/${currentUser._id}`, { replace: true });
  };

  if (isLoading) return <p className={styles.status}>Loading...</p>;
  if (errorText) return <p className={styles.status}>{errorText}</p>;

  return (
    <section className={styles.page}>
      <PublicationView
        publication={publication}
        isStandalone
        onUpdated={setPublication}
        onDeleted={handleDeleted}
      />
    </section>
  );
};

const PostPage = () => {
  const { id } = useParams();
  return <PostContent key={id} publicationId={id} />;
};

export default PostPage;