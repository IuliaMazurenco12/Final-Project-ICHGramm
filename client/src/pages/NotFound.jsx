import { Link } from 'react-router-dom';
import notFoundPicture from '../assets/phones2.png';
import styles from '../styles/NotFound.module.css';

const NotFound = () => (
  <section className={styles.page}>
    <img src={notFoundPicture} alt="" className={styles.picture} />

    <div className={styles.text}>
      <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
      <p className={styles.description}>
        We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t seem to exist.
        <br />
        If you typed the URL manually, please double-check the spelling.
        <br />
        If you clicked on a link, it may be outdated or broken.
      </p>
      <Link to="/" className={styles.homeLink}>
        Go back to Home
      </Link>
    </div>
  </section>
);

export default NotFound;