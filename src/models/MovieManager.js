import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
});

export const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true },
  title: { type: String },
  cast: { type: [Object] },
  crew: { type: [Object] },
  videos: { type: [Object] },
  posterPath: { type: String },
  watchProviders: { type: Object },
  images: {
    posterPaths: { type: [String] },
    backdropPaths: { type: [String] },
  },
  date: { type: Date },
  overview: { type: String },
  genres: { type: [genreSchema] },
  poster: { type: String },
  runtime: { type: Number },
}).index({ tmdbId: 1 });

export const defineMovieModel = mongoose.model('Movie', movieSchema);
