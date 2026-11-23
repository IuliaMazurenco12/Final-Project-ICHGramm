import { useEffect, useRef, useState } from 'react';
import { IoCloudUploadOutline } from 'react-icons/io5';
import httpClient from '../api/httpClient';
import { useCurrentUser } from '../context/CurrentUserContext';
import DimLayer from './DimLayer';
import AvatarBadge from './AvatarBadge';
import styles from '../styles/CreatePublication.module.css';

const CAPTION_LIMIT = 2200;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const CreatePublicationModal = ({ onClose, onCreated }) => {
  const { currentUser } = useCurrentUser();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    event.target.value = '';

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorText('Only JPG, PNG, WEBP or GIF images are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorText('Image must be smaller than 5 MB.');
      return;
    }

    setErrorText('');
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleShare = async () => {
    if (!imageFile || isSending) return;

    setIsSending(true);
    setErrorText('');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption.trim());

    try {
      const { data } = await httpClient.post('/publications', formData);
      onCreated(data.publication);
    } catch (error) {
      setErrorText(error.response?.data?.message || 'Could not share the publication.');
      setIsSending(false);
    }
  };

  const safeClose = isSending ? () => {} : onClose;

  return (
    <DimLayer onClose={safeClose}>
      <div className={styles.window} role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header className={styles.header}>
          <h2 id="create-title" className={styles.title}>
            Create new post
          </h2>
          <button
            type="button"
            className={styles.shareBtn}
            onClick={handleShare}
            disabled={!imageFile || isSending}
          >
            {isSending ? 'Sharing...' : 'Share'}
          </button>
        </header>

        <div className={styles.body}>
          <button
            type="button"
            className={styles.dropZone}
            onClick={() => fileInputRef.current.click()}
            aria-label={previewUrl ? 'Choose another photo' : 'Choose a photo'}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected" className={styles.preview} />
            ) : (
              <>
                <IoCloudUploadOutline size={56} />
                <span className={styles.dropHint}>Click to choose a photo</span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            hidden
            onChange={handleFileChange}
          />

          <aside className={styles.side}>
            <div className={styles.captionBlock}>
              <div className={styles.authorRow}>
                <AvatarBadge src={currentUser.avatar} size={28} alt={currentUser.username} />
                <span className={styles.authorName}>{currentUser.username}</span>
              </div>

              <textarea
                className={styles.captionField}
                placeholder="Write a caption..."
                value={caption}
                maxLength={CAPTION_LIMIT}
                onChange={(event) => setCaption(event.target.value)}
              />

              <p className={styles.counter}>
                {caption.length.toLocaleString('ru-RU')}/{CAPTION_LIMIT.toLocaleString('ru-RU')}
              </p>
            </div>

            {errorText && <p className={styles.errorText}>{errorText}</p>}
          </aside>
        </div>
      </div>
    </DimLayer>
  );
};

export default CreatePublicationModal;