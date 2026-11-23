import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import httpClient from '../api/httpClient';
import DimLayer from './DimLayer';
import AvatarBadge from './AvatarBadge';
import styles from '../styles/FollowListModal.module.css';

const TITLES = {
  followers: 'Followers',
  following: 'Following',
};

const FollowListModal = ({ profileId, kind, onClose }) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadList = async () => {
      try {
        const { data } = await httpClient.get(`/subscriptions/${profileId}/${kind}`);
        if (isActive) setUsers(data.users);
      } catch (error) {
        if (isActive) setErrorText(error.response?.data?.message || 'Could not load the list.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadList();

    return () => {
      isActive = false;
    };
  }, [profileId, kind]);

  const openMember = (memberId) => {
    onClose();
    navigate(`/profile/${memberId}`);
  };

  const renderBody = () => {
    if (isLoading) return <p className={styles.status}>Loading...</p>;
    if (errorText) return <p className={styles.status}>{errorText}</p>;
    if (users.length === 0) {
      return (
        <p className={styles.status}>
          {kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </p>
      );
    }

    return (
      <ul className={styles.list}>
        {users.map((member) => (
          <li key={member._id}>
            <button type="button" className={styles.row} onClick={() => openMember(member._id)}>
              <AvatarBadge src={member.avatar} size={44} alt={member.username} />
              <span className={styles.rowText}>
                <span className={styles.rowName}>{member.username}</span>
                {member.fullName && <span className={styles.rowFull}>{member.fullName}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DimLayer onClose={onClose}>
      <div className={styles.window} role="dialog" aria-modal="true" aria-label={TITLES[kind]}>
        <header className={styles.header}>
          <h2 className={styles.title}>{TITLES[kind]}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <IoClose size={22} />
          </button>
        </header>

        {renderBody()}
      </div>
    </DimLayer>
  );
};

export default FollowListModal;