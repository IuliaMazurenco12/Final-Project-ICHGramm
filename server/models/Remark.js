import mongoose from 'mongoose';

const remarkSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Publication is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Author is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      maxlength: [200, 'Comment must be at most 200 characters'],
    },
  },
  { timestamps: true }
);

remarkSchema.index({ publication: 1, createdAt: 1 });

remarkSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Remark = mongoose.model('Remark', remarkSchema);

export default Remark;