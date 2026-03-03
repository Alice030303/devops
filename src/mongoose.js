import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export default async function connectDB() {
  const uri =
    process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.info('✅ Connexion MongoDB réussie', conn.connection.host);
  } catch (err) {
    console.error('❌ Impossible de se connecter à MongoDB :', err.message);
  }
}
