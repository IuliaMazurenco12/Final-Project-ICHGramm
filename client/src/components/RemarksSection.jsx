import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../api/httpClient';
import AvatarBadge from './AvatarBadge';
import { useCurrentUser } from '../context/CurrentUserContext';
import describeAge from '../utils/describeAge';
import styles from '../styles/RemarksSection.module.css';

const RemarksSection = ({ publicationId, intro, children }) => {
  const { currentUser } = useCurrentUser();
  const [remarks, setRemarks] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadRemarks = async () => {
      try {
        const { data } = await httpClient.get(`/remarks/${publicationId}`);
        if (isActive) setRemarks(data.remarks);
      } catch (error) {
        if (isActive) {
          setErrorText(error.response?.data?.message || 'Could not load comments.');
        }
      }
    };

    loadRemarks();

    return () => {
      isActive = false;
    };
  }, [publicationId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSending(true);
    setErrorText('');
    try {
      const { data } = await httpClient.post(`/remarks/${publicationId}`, { text: trimmed });
      setRemarks((prev) => [...prev, data.remark]);
      setText('');
    } catch (error) {
      setErrorText(error.response?.data?.message || 'Could not add comment.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (remarkId) => {
    try {
      await httpClient.delete(`/remarks/${remarkId}`);
      setRemarks((prev) => prev.filter((remark) => remark._id !== remarkId));
    } catch (error) {
      setErrorText(error.response?.data?.message || 'Could not delete comment.');
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.scroll}>
        {intro}

        <ul className={styles.list}>
          {remarks.map((remark) => {
            const authorLink = `/profile/${remark.author._id}`;
            const isOwnRemark = currentUser?._id === remark.author._id;

            return (
              <li key={remark._id} className={styles.item}>
                <Link to={authorLink}>
                  <AvatarBadge src={remark.author.avatar} size={32} alt={remark.author.username} />
                </Link>
                <div className={styles.body}>
                  <p className={styles.text}>
                    <Link to={authorLink} className={styles.author}>
                      {remark.author.username}
                    </Link>{' '}
                    {remark.text}
                  </p>
                  <div className={styles.meta}>
                    <span>{describeAge(remark.createdAt)}</span>
                    {isOwnRemark && (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(remark._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {children}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Add comment..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={500}
          autoComplete="off"
        />
        <button type="submit" className={styles.sendBtn} disabled={!text.trim() || isSending}>
          Send
        </button>
      </form>

      {errorText && <p className={styles.error}>{errorText}</p>}
    </div>
  );
};

export default RemarksSection;