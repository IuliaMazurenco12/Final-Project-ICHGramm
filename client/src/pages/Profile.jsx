import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoLinkOutline } from 'react-icons/io5';
import httpClient from '../api/httpClient';
import { useCurrentUser } from '../context/CurrentUserContext';
import AvatarBadge from '../components/AvatarBadge';
import DimLayer from '../components/DimLayer';
import PublicationView from '../components/PublicationView';
import styles from '../styles/Profile.module.css';
import FollowListModal from '../components/FollowListModal';

const toExternalUrl = (website) =>
  /^https?:\/\//i.test(website) ? website : `https://${website}`;

const toShortUrl = (website) => website.replace(/^https?:\/\//i, '').replace(/\/$/, '');

const plural = (count, word) => (count === 1 ? word : `${word}s`);

const ProfileView = ({ profileId }) => {
  const navigate = useNavigate();
  const { currentUser, endSession } = useCurrentUser();

  const [member, setMember] = useState(null);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [isFollowBusy, setIsFollowBusy] = useState(false);
  const [listKind, setListKind] = useState(null);

  const isOwnProfile = currentUser._id === profileId;
  const selectedPublication = publications.find((publication) => publication._id === selectedId);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        const [profileResponse, publicationsResponse] = await Promise.all([
          httpClient.get(`/profile/${profileId}`),
          httpClient.get(`/publications/user/${profileId}`),
        ]);

        if (!isActive) return;
        setMember(profileResponse.data.user);
        setPublications(publicationsResponse.data.publications);
      } catch (error) {
        if (!isActive) return;
        const status = error.response?.status;
        setErrorText(
          status === 404 || status === 400
            ? 'This profile does not exist.'
            : error.response?.data?.message || 'Could not load the profile.'
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [profileId]);

  const toggleFollow = async () => {
    setIsFollowBusy(true);

    try {
      const { data } = member.isFollowedByMe
        ? await httpClient.delete(`/subscriptions/${profileId}`)
        : await httpClient.post(`/subscriptions/${profileId}`);

      setMember((prev) => ({
        ...prev,
        isFollowedByMe: data.isFollowing,
        followersCount: data.followersCount,
      }));
    } catch (error) {
      console.error('Follow toggle failed:', error);
    } finally {
      setIsFollowBusy(false);
    }
  };

  const closeViewer = useCallback(() => setSelectedId(null), []);
  const closeList = useCallback(() => setListKind(null), []);

  const handlePublicationUpdated = (updated) => {
    setPublications((prev) =>
      prev.map((publication) => (publication._id === updated._id ? updated : publication))
    );
  };

  const handlePublicationDeleted = (deletedId) => {
    setPublications((prev) => prev.filter((publication) => publication._id !== deletedId));
    setSelectedId(null);
  };

  const handleLogout = () => {
    endSession();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return <p className={styles.status}>Loading...</p>;
  }

  if (errorText) {
    return <p className={styles.status}>{errorText}</p>;
  }

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <div className={styles.ring}>
          <AvatarBadge src={member.avatar} size={150} alt={member.username} />
        </div>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1 className={styles.username}>{member.username}</h1>

            {isOwnProfile ? (
              <>
                <Link to="/profile/edit" className={styles.greyBtn}>
                  Edit profile
                </Link>
                <button type="button" className={styles.greyBtn} onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                className={
                  member.isFollowedByMe
                    ? `${styles.greyBtn} ${styles.followingBtn}`
                    : styles.blueBtn
                }
                onClick={toggleFollow}
                disabled={isFollowBusy}
              >
                {member.isFollowedByMe ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

       <ul className={styles.stats}>
  <li>
    <strong>{publications.length}</strong> {plural(publications.length, 'post')}
  </li>
  <li>
    <button type="button" className={styles.statBtn} onClick={() => setListKind('followers')}>
      <strong>{member.followersCount}</strong> {plural(member.followersCount, 'follower')}
    </button>
  </li>
  <li>
    <button type="button" className={styles.statBtn} onClick={() => setListKind('following')}>
      <strong>{member.followingCount}</strong> following
    </button>
  </li>
</ul>

          {member.fullName && <p className={styles.fullName}>{member.fullName}</p>}
          {member.bio && <p className={styles.bio}>{member.bio}</p>}

          {member.website && (
            <a
              href={toExternalUrl(member.website)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.website}
            >
              <IoLinkOutline size={14} />
              {toShortUrl(member.website)}
            </a>
          )}
        </div>
      </header>

      {publications.length === 0 ? (
        <p className={styles.status}>No publications yet</p>
      ) : (
        <div className={styles.grid}>
          {publications.map((publication) => (
            <button
              key={publication._id}
              type="button"
              className={styles.tile}
              onClick={() => setSelectedId(publication._id)}
              aria-label={publication.caption || 'Open publication'}
            >
              <img src={publication.image} alt="" className={styles.tileImage} loading="lazy" />
            </button>
          ))}
        </div>
      )}

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

        {listKind && (
        <FollowListModal profileId={profileId} kind={listKind} onClose={closeList} />
      )}

      
    </section>
  );
};

const Profile = () => {
  const { id } = useParams();
  return <ProfileView key={id} profileId={id} />;
};

export default Profile;