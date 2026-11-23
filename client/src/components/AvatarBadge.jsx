import styles from '../styles/AvatarBadge.module.css';

const AvatarBadge = ({ src, size = 24, alt = 'avatar' }) => {
  const dimensions = { width: size, height: size };

  if (src) {
    return <img src={src} alt={alt} className={styles.badge} style={dimensions} />;
  }

  return (
    <span
      className={`${styles.badge} ${styles.placeholder}`}
      style={{ ...dimensions, fontSize: size * 0.3 }}
    >
      ICH
    </span>
  );
};

export default AvatarBadge;