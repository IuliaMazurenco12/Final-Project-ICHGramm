import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoChatbubbleOutline } from 'react-icons/io5';
import AvatarBadge from './AvatarBadge';
import useHeartToggle from '../hooks/useHeartToggle';
import { useCurrentUser } from '../context/CurrentUserContext';
import httpClient from '../api/httpClient';
import describeAge from '../utils/describeAge';
import formatLikes from '../utils/formatLikes';
import styles from '../styles/PublicationCard.module.css';

const PublicationCard = ({ publication, onFollowed }) => {
  const { _id, author, image, caption, createdAt, authorFollowedByMe } = publication;
  const { liked, heartsCount, toggleHeart } = useHeartToggle(
    _id,
    publication.likedByMe,
    publication.heartsCount
  );
  const { currentUser } = useCurrentUser();
  const [isFollowSending, setIsFollowSending] = useState(false);

  const profileLink = `/profile/${author._id}`;
  const isOwnPublication = currentUser?._id === author._id;
  const showFollow = Boolean(onFollowed) && !isOwnPublication && !authorFollowedByMe;

  const handleFollow = async () => {
    setIsFollowSending(true);
    try {
      await httpClient.post(`/subscriptions/${author._id}`);
      onFollowed(author._id);
    } catch (error) {
      if (error.response?.status === 409) {
        onFollowed(author._id);
      } else {
        setIsFollowSending(false);
      }
    }
  };

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <Link to={profileLink} className={styles.ring}>
          <AvatarBadge src={author.avatar} size={32} alt={author.username} />
        </Link>
        <Link to={profileLink} className={styles.author}>
          {author.username}
        </Link>
        <span className={styles.age}>• {describeAge(createdAt)}</span>

        {showFollow && (
          <>
            <span className={styles.age}>•</span>
            <button
              type="button"
              className={styles.followBtn}
              onClick={handleFollow}
              disabled={isFollowSending}
            >
              follow
            </button>
          </>
        )}
      </header>

      <img
        src={image}
        alt={caption || `Publication by ${author.username}`}
        className={styles.photo}
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.heartBtn}
          onClick={toggleHeart}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? (
            <IoHeart size={24} className={styles.heartFilled} />
          ) : (
            <IoHeartOutline size={24} />
          )}
        </button>

        <Link to={`/post/${_id}`} className={styles.commentLink} aria-label="Open publication">
          <IoChatbubbleOutline size={24} />
        </Link>
      </div>

      <p className={styles.likes}>{formatLikes(heartsCount)}</p>

      {caption && (
        <p className={styles.caption}>
          <Link to={profileLink} className={styles.captionAuthor}>
            {author.username}
          </Link>
          {caption}
        </p>
      )}
    </article>
  );
};

export default PublicationCard;