import Heart from '../models/Heart.js';

const withHeartStats = async (publications, viewerId) => {
  const publicationIds = publications.map((publication) => publication._id);

  const [counts, myHearts] = await Promise.all([
    Heart.aggregate([
      { $match: { publication: { $in: publicationIds } } },
      { $group: { _id: '$publication', total: { $sum: 1 } } },
    ]),
    Heart.find({ publication: { $in: publicationIds }, account: viewerId }).select('publication'),
  ]);

  const countById = new Map(counts.map((item) => [item._id.toString(), item.total]));
  const likedIds = new Set(myHearts.map((heart) => heart.publication.toString()));

  return publications.map((publication) => {
    const id = publication._id.toString();
    return {
      ...publication.toJSON(),
      heartsCount: countById.get(id) || 0,
      likedByMe: likedIds.has(id),
    };
  });
};

export default withHeartStats;