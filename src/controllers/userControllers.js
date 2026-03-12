import bcrypt from 'bcryptjs';
import { defineUserModel } from '../models/User.js';

export async function updateSettings(
  userId,
  name,
  email,
  password,
  newPassword
) {
  try {
    const user = await defineUserModel.findById(userId);
    if (!user) return 'Utilisateur non trouvé';

    if ((newPassword || email) && password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Mot de passe actuel incorrect');
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      user.email = email;
      // TODO: envoyer un mail de confirmation ici
    }
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    return { success: true, message: 'Profil mis à jour' };
  } catch (e) {
    console.error(e);
    return { error: 'Erreur lors de la mise à jour du profil' };
  }
}

export async function getProfile(userId) {
  try {
    const user = await defineUserModel.findById(userId);
    if (!user) return 'Utilisateur non trouvé';

    const { _id, name, email, wishlist, favorite, watched } = user;
    return { _id, name, email, wishlist, favorite, watched };
  } catch (e) {
    throw new Error('Erreur lors de la récupération du profil');
  }
}

export async function searchUsers(search) {
  try {
    if (!search || search.length < 1) {
      return [];
    }

    const users = await defineUserModel.find({
      name: { $regex: search, $options: 'i' },
    });
    return users;
  } catch (error) {
    console.error(error);
    throw new Error('Erreur recherche utilisateurs');
  }
}
export async function removeFromList(idMovieToRemove, userId, listType) {
  try {
    if (!idMovieToRemove) {
      throw new Error('movie id required');
    }

    await defineUserModel.findByIdAndUpdate(userId, {
      $pull: { [listType]: idMovieToRemove },
    });

    return {
      success: true,
      message: 'Le film a été retiré de votre liste',
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Impossible de retirer de ${listType}`);
  }
}
