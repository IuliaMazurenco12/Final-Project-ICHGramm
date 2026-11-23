import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLinkOutline } from 'react-icons/io5';
import httpClient from '../api/httpClient';
import { useCurrentUser } from '../context/CurrentUserContext';
import AvatarBadge from '../components/AvatarBadge';
import styles from '../styles/EditProfile.module.css';

const BIO_LIMIT = 150;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EditProfile = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    username: currentUser.username,
    website: currentUser.website || '',
    bio: currentUser.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarPick = (event) => {
    const file = event.target.files[0];
    event.target.value = '';

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setGeneralError('Only JPG, PNG, WEBP or GIF images are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setGeneralError('Image must be smaller than 5 MB.');
      return;
    }

    setGeneralError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setGeneralError('');

    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('website', form.website);
    formData.append('bio', form.bio);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const { data } = await httpClient.put('/profile', formData);
      setCurrentUser(data.user);
      navigate(`/profile/${data.user._id}`);
    } catch (error) {
      const serverReply = error.response?.data;

      if (serverReply?.field) {
        setFieldErrors({ [serverReply.field]: serverReply.message });
      } else {
        setGeneralError(serverReply?.message || 'Could not save changes.');
      }
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Edit profile</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.photoCard}>
          <AvatarBadge
            src={avatarPreview || currentUser.avatar}
            size={56}
            alt={currentUser.username}
          />
          <div className={styles.photoText}>
            <p className={styles.photoName}>{currentUser.username}</p>
            {form.bio && <p className={styles.photoBio}>{form.bio}</p>}
          </div>
          <button
            type="button"
            className={styles.blueBtn}
            onClick={() => fileInputRef.current.click()}
          >
            New photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            hidden
            onChange={handleAvatarPick}
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Username</span>
          <input
            name="username"
            className={styles.input}
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          {fieldErrors.username && <span className={styles.fieldError}>{fieldErrors.username}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Website</span>
          <span className={styles.inputWrap}>
            <IoLinkOutline size={16} className={styles.inputIcon} />
            <input
              name="website"
              className={`${styles.input} ${styles.inputWithIcon}`}
              placeholder="bit.ly/your-link"
              value={form.website}
              onChange={handleChange}
            />
          </span>
          {fieldErrors.website && <span className={styles.fieldError}>{fieldErrors.website}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>About</span>
          <span className={styles.textareaWrap}>
            <textarea
              name="bio"
              className={styles.textarea}
              value={form.bio}
              maxLength={BIO_LIMIT}
              onChange={handleChange}
            />
            <span className={styles.counter}>
              {form.bio.length} / {BIO_LIMIT}
            </span>
          </span>
          {fieldErrors.bio && <span className={styles.fieldError}>{fieldErrors.bio}</span>}
        </label>

        {generalError && <p className={styles.errorText}>{generalError}</p>}

        <button
          type="submit"
          className={`${styles.blueBtn} ${styles.saveBtn}`}
          disabled={isSaving || !form.username.trim()}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </section>
  );
};

export default EditProfile;