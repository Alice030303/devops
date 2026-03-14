import { defineMovieModel } from '../models/MovieManager.js';
import { defineUserModel } from '../models/User.js';

const API_KEY = process.env.API_KEY_TMDB;
const TMDB_URL = process.env.TMDB_BASE_URL;

export async function list(params) {
  try {
    const page = params.page || 1;
    const response = await fetch(`${TMDB_URL}/discover/movie?page=${page}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.API_KEY_TMDB}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status}`);
    }


    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Impossible de récupérer les films');
  }
}

export async function search(query, page = 1) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&page=${page}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.API_KEY_TMDB}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status}`);
    }


    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Impossible de rechercher des films');
  }
}

export async function watchDetails(idMovie) {
  if (!idMovie) {
    throw new Error('idMovie is required');
  }

  try {
    
    const movieInDB = await defineMovieModel.findOne({ tmdbId: idMovie });
    if (movieInDB) {
      const hasDetails =
        (movieInDB.cast?.length > 0) ||
        (movieInDB.videos?.length > 0) ||
        (movieInDB.watchProviders && Object.keys(movieInDB.watchProviders).length > 0);

      if (hasDetails) return movieInDB;
    }

    
    const responseMovie = await fetch(`${TMDB_URL}/${idMovie}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!responseMovie.ok) {
      throw new Error(`Erreur TMDB movie: ${responseMovie.status}`);
    }

    const movieDetails = await responseMovie.json();

    
    const safeFetch = async (url) => {
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    };

    
    const [credits, videos, images, watchProvidersData] = await Promise.all([
      safeFetch(`${TMDB_URL}/${idMovie}/credits`),
      safeFetch(`${TMDB_URL}/${idMovie}/videos`),
      safeFetch(`${TMDB_URL}/${idMovie}/images`),
      safeFetch(`${TMDB_URL}/${idMovie}/watch/providers`),
    ]);

    
    if (!credits) console.warn(`Credits introuvables pour ${idMovie}`);
    if (!videos) console.warn(`Vidéos introuvables pour ${idMovie}`);
    if (!images) console.warn(`Images introuvables pour ${idMovie}`);
    if (!watchProvidersData) console.warn(`Watch providers introuvables pour ${idMovie}`);

    
    const posterPaths = images?.posters?.map(p => p.file_path) || [];
    const backdropPaths = images?.backdrops?.map(b => b.file_path) || [];
    const imagesToStore = { posterPaths, backdropPaths };

    
    const limitedCast = credits?.cast?.slice(0, 10) || [];
    const limitedCrew = credits?.crew?.slice(0, 10) || [];
    const limitedVideos = videos?.results || [];
    const limitedProviders = watchProvidersData?.results?.FR || {};

    
    const updatedMovieData = {
      ...movieDetails,
      date: movieDetails.release_date,
      overview: movieDetails.overview,
      posterPath: movieDetails.poster_path,
      cast: limitedCast,
      crew: limitedCrew,
      videos: limitedVideos,
      images: imagesToStore,
      runtime: movieDetails.runtime,
      watchProviders: limitedProviders,
    };

    
    const savedMovie = await defineMovieModel.findOneAndUpdate(
      { tmdbId: idMovie },
      updatedMovieData,
      { new: true, upsert: true }
    );

    if (!savedMovie) {
      throw new Error('Erreur lors de la sauvegarde du film avec les détails');
    }

    return savedMovie;
  } catch (error) {
    console.error('Erreur dans watchDetails:', error);
    throw error;
  }
}
export async function addToFavorite(movieToAdd, userId) {
  try {
    if (!movieToAdd || !movieToAdd.tmdbId) {
      throw new Error('movie object with tmdbId required');
    }
    let movie = await defineMovieModel.findOne({ tmdbId: movieToAdd.tmdbId });
    if (!movie) {
      movie = await watchDetails(movieToAdd.tmdbId);
    }
    await defineUserModel.findByIdAndUpdate(userId, {
      $addToSet: { favorite: movie.tmdbId },
    });
    return {
      success: true,
      message: 'Le film a été ajouté à vos favoris',
    };
  } catch (error) {
    console.error(error);
    throw new Error("Impossible d'ajouter à la liste des favoris");
  }
}
export async function addToWishlist(movieToAdd, userId) {
  try {
    if (!movieToAdd || !movieToAdd.tmdbId) {
      throw new Error('movie object with tmdbId required');
    }
    let movie = await defineMovieModel.findOne({ tmdbId: movieToAdd.tmdbId });
    if (!movie) {
      movie = await watchDetails(movieToAdd.tmdbId);
    }
    await defineUserModel.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: movie.tmdbId },
    });
    return {
      success: true,
      message: 'Le film a été ajouté à votre liste de visionnage',
    };
  } catch (error) {
    console.error(error);
    throw new Error("Impossible d'ajouter à la wishlist");
  }
}
export async function addToWatched(movieToAdd, userId) {
  try {
    if (!movieToAdd || !movieToAdd.tmdbId) {
      throw new Error('movie object with tmdbId required');
    }

    let movie = await defineMovieModel.findOne({ tmdbId: movieToAdd.tmdbId });
    if (!movie) {
      movie = await watchDetails(movieToAdd.tmdbId);
    }
    await defineUserModel.findByIdAndUpdate(userId, {
      $addToSet: { watched: movie.tmdbId },
      $pull: { wishlist: movie.tmdbId },
    });

    return {
      success: true,
      message: 'Le film a été marqué comme vu et retiré de la wishlist',
    };
  } catch (error) {
    console.error(error);

    throw new Error("Impossible de mettre à jour les listes de l'utilisateur");
  }
}

export async function findMoviesByIds(ids) {
  try {
    if (!Array.isArray(ids) || !ids.length) {
      throw new Error('ids must be a non-empty array');
    }
    const movies = await defineMovieModel.find({ tmdbId: { $in: ids } });
    return movies;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching movies by IDs');
  }
}

export async function getRecommendationsFromFavorites(
  favoritesIds,
  watchedIds = []
) {
  try {
    if (!Array.isArray(favoritesIds) || favoritesIds.length === 0)
      throw new Error('Aucun favori fourni');

    const favorites = await findMoviesByIds(favoritesIds);

    const shuffled = favorites.sort(() => 0.5 - Math.random());
    const tenFavorites = shuffled.slice(0, 10);
    const prompt = `Voici mes films préférés :\n${tenFavorites
      .map((f) => `- ${f.title} : ${f.overview || ''}`)
      .join(
        '\n'
      )}\nPeux-tu me conseiller 7 films dans le même style (uniquement le titre, séparés par des virgules) ?`;

    const { OPENAI_API_KEY } = process.env;
    const openaiRes = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Tu es un expert en cinéma.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      }
    );

    if (!openaiRes.ok) throw new Error('Erreur OpenAI');
    const openaiData = await openaiRes.json();

    const text = openaiData.choices?.[0]?.message?.content || '';
    let titles = [];
    const afterColon = text.split(':').slice(1).join(':');
    if (afterColon) {
      titles = afterColon
        .split(/\n|\r|-/)
        .map((t) => t.trim())
        .filter(Boolean)
        .filter((t) => t.length > 1 && !/^\d/.test(t));
    }
    const tmdbResults = await Promise.all(
      titles.map(async (title) => {
        try {
          const tmdbRes = await search(title, 1);
          if (tmdbRes && tmdbRes.results && tmdbRes.results.length > 0) {
            return tmdbRes.results[0];
          }
        } catch (err) {
          console.error(`Erreur recherche TMDB pour "${title}":`, err);
        }
        return null;
      })
    );

    // On enlève les nulls d'abord
    const nonNullResults = tmdbResults.filter(Boolean);
    const filtered = nonNullResults.filter((movie) => {
      if (!movie || !movie.id) return false;
      const isInFavorites = favorites.some((f) => f.tmdbId === movie.id);
      // Si pas de watchedIds, on ne filtre que sur favoris
      if (!watchedIds || watchedIds.length === 0) return !isInFavorites;
      // Optionnel : si watchedIds sont des tmdbId, on compare
      return !isInFavorites && !watchedIds.includes(movie.id.toString());
    });
    return filtered;
  } catch (e) {
    console.error('Erreur recommandations IA:', e);
    throw new Error('Erreur lors de la génération des recommandations.');
  }
}
