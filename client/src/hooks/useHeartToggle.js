import { useState } from 'react';
import httpClient from '../api/httpClient';

const useHeartToggle = (publicationId, initialLiked, initialCount, onChange) => {
  const [liked, setLiked] = useState(initialLiked);
  const [heartsCount, setHeartsCount] = useState(initialCount);
  const [isToggling, setIsToggling] = useState(false);

  const toggleHeart = async () => {
    if (isToggling) return;
    setIsToggling(true);

    const before = { liked, heartsCount };
    setLiked(!liked);
    setHeartsCount(liked ? heartsCount - 1 : heartsCount + 1);

    try {
      const { data } = await httpClient.post(`/hearts/${publicationId}`);
      setLiked(data.liked);
      setHeartsCount(data.heartsCount);
      onChange?.({ liked: data.liked, heartsCount: data.heartsCount });
    } catch {
      setLiked(before.liked);
      setHeartsCount(before.heartsCount);
    } finally {
      setIsToggling(false);
    }
  };

  return { liked, heartsCount, toggleHeart };
};

export default useHeartToggle;