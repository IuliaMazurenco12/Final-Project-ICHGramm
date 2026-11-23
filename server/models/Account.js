import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const accountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    bio: { type: String, default: '', maxlength: 150 },
    website: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Хэшируем пароль перед сохранением
accountSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Сравниваем введённый пароль с хэшем
accountSchema.methods.checkPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Убираем пароль из любого ответа клиенту
accountSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const Account = mongoose.model('Account', accountSchema);

export default Account;