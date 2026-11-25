import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoEllipsisHorizontal } from 'react-icons/io5';
import httpClient from '../api/httpClient';
import { useCurrentUser } from '../context/CurrentUserContext';
import useHeartToggle from '../hooks/useHeartToggle';
import AvatarBadge from './AvatarBadge';
import RemarksSection from './RemarksSection';
import ActionSheet from './ActionSheet';
import describeAge from '../utils/describeAge';
import formatLikes from '../utils/formatLikes';
import styles from '../styles/PublicationView.module.css';

const CAPTION_LIMIT = 2200;

const PublicationView = ({ publication, isStandalone = false, onUpdated, onDeleted }) => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { _id, author, image, createdAt } = publication;
  const { liked, heartsCount, toggleHeart } = useHeartToggle(
    _id,
    publication.likedByMe,
    publication.heartsCount
  );

  const [caption, setCaption] = useState(publication.caption);
  const [draftCaption, setDraftCaption] = useState(publication.caption);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const isOwn = currentUser._id === author._id;
  const profileLink = `/profile/${author._id}`;

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 2000);
  };

  const handleDelete = async () => {
    setIsMenuOpen(false);
    setIsBusy(true);

    try {
      await httpClient.delete(`/publications/${_id}`);
      onDeleted?.(_id);
    } catch (error) {
      setIsBusy(false);
      showNotice(error.response?.data?.message || 'Could not delete the publication.');
    }
  };

  const startEditing = () => {
    setDraftCaption(caption);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveCaption = async () => {
    setIsBusy(true);

    try {
      const { data } = await httpClient.put(`/publications/${_id}`, {
        caption: draftCaption.trim(),
      });
      setCaption(data.publication.caption);
      setIsEditing(false);
      onUpdated?.(data.publication);
    } catch (error) {
      showNotice(error.response?.data?.message || 'Could not save the caption.');
    } finally {
      setIsBusy(false);
    }
  };

  const goToPost = () => {
    setIsMenuOpen(false);
    navigate(`/post/${_id}`);
  };

  const copyLink = async () => {
    setIsMenuOpen(false);

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${_id}`);
      showNotice('Link copied.');
    } catch {
      showNotice('Could not copy the link.');
    }
  };

  const menuActions = [
    { label: 'Delete', onSelect: handleDelete, danger: true },
    { label: 'Edit', onSelect: startEditing },
    ...(isStandalone ? [] : [{ label: 'Go to post', onSelect: goToPost }]),
    { label: 'Copy link', onSelect: copyLink },
  ];

  const captionBlock = (
    <div className={styles.body}>
      {isEditing ? (
        <div className={styles.editor}>
          <textarea
            className={styles.editField}
            value={draftCaption}
            maxLength={CAPTION_LIMIT}
            onChange={(event) => setDraftCaption(event.target.value)}
            autoFocus
          />
          <div className={styles.editBar}>
            <span className={styles.counter}>
              {draftCaption.length}/{CAPTION_LIMIT}
            </span>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => setIsEditing(false)}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.textBtn} ${styles.textBtnAccent}`}
              onClick={handleSaveCaption}
              disabled={isBusy}
            >
              {isBusy ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        caption && (
          <div className={styles.captionRow}>
            <AvatarBadge src={author.avatar} size={32} alt="" />
            <div>
              <p className={styles.captionText}>
                <Link to={profileLink} className={styles.author}>
                  {author.username}
                </Link>{' '}
                {caption}
              </p>
              <p className={styles.age}>{describeAge(createdAt)}</p>
            </div>
          </div>
        )
      )}
    </div>
  );

  return (
    <article className={styles.view}>
      <div className={styles.media}>
        <img
          src={image}
          alt={caption || `Publication by ${author.username}`}
          className={styles.photo}
        />
      </div>

      <div className={styles.side}>
        <header className={styles.head}>
          <Link to={profileLink} className={styles.ring}>
            <AvatarBadge src={author.avatar} size={32} alt={author.username} />
          </Link>
          <Link to={profileLink} className={styles.author}>
            {author.username}
          </Link>

          {isOwn && (
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => setIsMenuOpen(true)}
              disabled={isBusy}
              aria-label="More options"
            >
              <IoEllipsisHorizontal size={20} />
            </button>
          )}
        </header>

        <RemarksSection publicationId={_id} intro={captionBlock}>
          <footer className={styles.foot}>
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
            <p className={styles.likes}>{formatLikes(heartsCount)}</p>
            <p className={styles.age}>{describeAge(createdAt)}</p>
            {notice && (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            )}
          </footer>
        </RemarksSection>
      </div>

      {isMenuOpen && <ActionSheet actions={menuActions} onClose={() => setIsMenuOpen(false)} />}
    </article>
  );
};

export default PublicationView;