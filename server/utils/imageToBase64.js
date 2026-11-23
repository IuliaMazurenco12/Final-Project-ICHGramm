import sharp from 'sharp';

const imageToBase64 = async (file, maxSide = 1080) => {
  const compressed = await sharp(file.buffer)
    .rotate()
    .resize({
      width: maxSide,
      height: maxSide,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  return `data:image/jpeg;base64,${compressed.toString('base64')}`;
};

export default imageToBase64;