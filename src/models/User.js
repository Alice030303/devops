import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    watched: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  },
  { timestamps: true }
);

export const defineUserModel = mongoose.model('User', userSchema);
