import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    favorite: [{ type: String, ref: 'Movie' }],
    watched: [{ type: String, ref: 'Movie' }],
    wishlist: [{ type: String, ref: 'Movie' }],
  },
  { timestamps: true }
);

export const defineUserModel = mongoose.model('User', userSchema);
