import mongoose from 'mongoose';

const heartSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account is required'],
    },
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Publication is required'],
    },
  },
  { timestamps: true }
);

heartSchema.index({ account: 1, publication: 1 }, { unique: true }); //защита от повторного лайка одной публикации одним пользователем
heartSchema.index({ publication: 1 });

heartSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Heart = mongoose.model('Heart', heartSchema);

export default Heart;