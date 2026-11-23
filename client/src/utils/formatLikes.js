const formatLikes = (count) =>
  `${count.toLocaleString('ru-RU')} ${count === 1 ? 'like' : 'likes'}`;

export default formatLikes;