import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCloseCircle } from "react-icons/io5";
import httpClient from "../api/httpClient";
import { useCurrentUser } from "../context/CurrentUserContext";
import AvatarBadge from "./AvatarBadge";
import styles from "../styles/SearchPanel.module.css";

const RECENT_LIMIT = 10;

const readRecent = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
};

const MemberRow = ({ member, onPick }) => (
  <li>
    <button type="button" className={styles.row} onClick={() => onPick(member)}>
      <AvatarBadge src={member.avatar} size={44} alt={member.username} />
      <span className={styles.rowText}>
        <span className={styles.rowName}>{member.username}</span>
        {member.fullName && (
          <span className={styles.rowFull}>{member.fullName}</span>
        )}
      </span>
    </button>
  </li>
);

const SearchPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const inputRef = useRef(null);
  const recentKey = `ichgram_recent_${currentUser._id}`;

  const [query, setQuery] = useState("");
  const [found, setFound] = useState({ query: "", users: [] });
  const [recent, setRecent] = useState(() => readRecent(recentKey));

  const trimmedQuery = query.trim();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!trimmedQuery) return;

    let isActive = true;

    const searchMembers = async () => {
      try {
        const { data } = await httpClient.get("/profile/search", {
          params: { q: trimmedQuery },
        });
        if (isActive) setFound({ query: trimmedQuery, users: data.users });
      } catch {
        if (isActive) setFound({ query: trimmedQuery, users: [] });
      }
    };

    searchMembers();

    return () => {
      isActive = false;
    };
  }, [trimmedQuery]);

  const openMember = (member) => {
    const updated = [
      member,
      ...recent.filter((item) => item._id !== member._id),
    ].slice(0, RECENT_LIMIT);
    setRecent(updated);
    localStorage.setItem(recentKey, JSON.stringify(updated));

    onClose();
    navigate(`/profile/${member._id}`);
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current.focus();
  };

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const renderResults = () => {
    if (found.query !== trimmedQuery) {
      return <p className={styles.status}>Searching...</p>;
    }
    if (found.users.length === 0) {
      return <p className={styles.status}>No results found.</p>;
    }
    return (
      <ul className={styles.list}>
        {found.users.map((member) => (
          <MemberRow key={member._id} member={member} onPick={openMember} />
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <aside className={styles.panel} role="dialog" aria-label="Search">
        <h2 className={styles.title}>Search</h2>

        <div className={styles.fieldWrap}>
          <input
            ref={inputRef}
            className={styles.field}
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearQuery}
              aria-label="Clear search"
            >
              <IoCloseCircle size={18} />
            </button>
          )}
        </div>

        {trimmedQuery ? (
          <div className={styles.results}>{renderResults()}</div>
        ) : (
          <>
            <h3 className={styles.subtitle}>Recent</h3>
            {recent.length === 0 ? (
              <p className={styles.status}>No recent searches.</p>
            ) : (
              <ul className={styles.list}>
                {recent.map((member) => (
                  <MemberRow
                    key={member._id}
                    member={member}
                    onPick={openMember}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </aside>
    </div>
  );
};

export default SearchPanel;
