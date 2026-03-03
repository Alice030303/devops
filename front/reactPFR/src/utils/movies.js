
export async function fetchMoviesByIds(ids, options = {}) {
  const BACK_URL = import.meta.env.VITE_BACK_URL;
  if (!ids || !ids.length) return [];
  const res = await fetch(`${BACK_URL}/movies/findMovies`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    method: "POST",
    credentials: options.credentials || 'include',
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) return [];
  return await res.json();
}
