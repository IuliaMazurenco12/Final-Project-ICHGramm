import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Follower is required'],
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Following is required'],
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ follower: 1, following: 1 }, { unique: true });
subscriptionSchema.index({ following: 1 });

subscriptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;