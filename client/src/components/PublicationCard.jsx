import { Link } from 'react-router-dom';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import AvatarBadge from './AvatarBadge';
import useHeartToggle from '../hooks/useHeartToggle';
import describeAge from '../utils/describeAge';
import formatLikes from '../utils/formatLikes';
import styles from '../styles/PublicationCard.module.css';

const PublicationCard = ({ publication }) => {
  const { _id, author, image, caption, createdAt } = publication;
  const { liked, heartsCount, toggleHeart } = useHeartToggle(
    _id,
    publication.likedByMe,
    publication.heartsCount
  );

  const profileLink = `/profile/${author._id}`;

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