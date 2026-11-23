import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Author is required'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    caption: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2200, 'Caption must be at most 2200 characters'],
    },
  },
  { timestamps: true }
);

publicationSchema.index({ author: 1, createdAt: -1 });

publicationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Publication = mongoose.model('Publication', publicationSchema);

export default Publication;