//
// Kollywood QuizMaster TMDB API utility module
//
// Handles requests to The Movie Database (TMDB) API for Kollywood (Tamil) movies.
//
// This module is reusable across quiz components.
// Uses "ta" (Tamil language) filter and supports fetching movies, details, posters, and more.
//

const TMDB_API_KEY = "5bc67d3b06aecbd18121a3cbbc16eb59";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

const DEFAULT_POSTER_SIZE = "w500";
const TAMIL_LANGUAGE = "ta"; // ISO 639-1 language code
const IN_REGION = "IN"; // For India/Indian movies

// PUBLIC_INTERFACE
/**
 * Fetches a list of Kollywood (Tamil) movies.
 * @param {Object} options Optional params: page, sortBy, year, withGenres
 * @returns {Promise<Object>} TMDB API movie list response
 */
export async function getKollywoodMovies(options = {}) {
  /**
   * This fetches a list of Tamil-language movies using TMDB's discover endpoint.
   * You may modify 'sort_by', 'year', and 'with_genres' as needed.
   */
  const {
    page = 1,
    sortBy = "popularity.desc",
    year,
    withGenres
  } = options;

  // Note: 'with_original_language' filters for Tamil, region 'IN' restricts to India
  // For Kollywood, filtering by language is best
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    sort_by: sortBy,
    with_original_language: TAMIL_LANGUAGE,
    region: IN_REGION,
    page
  });
  if (year) params.append("year", year);
  if (withGenres) params.append("with_genres", withGenres);

  const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch Kollywood movies");

  return await response.json();
}

// PUBLIC_INTERFACE
/**
 * Fetches detailed info for a given movie by TMDB ID.
 * @param {number|string} movieId
 * @returns {Promise<Object>} Movie detail object
 */
export async function getMovieDetails(movieId) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: `${TAMIL_LANGUAGE}-IN`
  });
  const url = `${TMDB_BASE_URL}/movie/${movieId}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch movie details");

  return await response.json();
}

// PUBLIC_INTERFACE
/**
 * Given a TMDB movie object, returns the poster full URL.
 * @param {Object} movie
 * @param {string} movie.poster_path
 * @param {string} [size]
 * @returns {string} Poster image URL, or placeholder if unavailable.
 */
export function getPosterUrl(movie, size = DEFAULT_POSTER_SIZE) {
  if (!movie || !movie.poster_path) return "https://via.placeholder.com/500x750?text=No+Poster";
  return `${TMDB_IMAGE_BASE_URL}${size}${movie.poster_path}`;
}

// PUBLIC_INTERFACE
/**
 * Fetches the cast and crew for a Kollywood movie.
 * @param {number|string} movieId
 * @returns {Promise<Object>} { cast, crew }
 */
export async function getMovieCredits(movieId) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: `${TAMIL_LANGUAGE}-IN`
  });
  const url = `${TMDB_BASE_URL}/movie/${movieId}/credits?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch movie credits");
  return await response.json();
}

// PUBLIC_INTERFACE
/**
 * Searches for Kollywood (Tamil) movies by keyword.
 * @param {string} query
 * @param {Object} options Optional params: page
 * @returns {Promise<Object>} TMDB search result
 */
export async function searchKollywoodMovies(query, options = {}) {
  const { page = 1 } = options;
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query,
    language: TAMIL_LANGUAGE,
    region: IN_REGION,
    page
  });
  const url = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to search Kollywood movies");
  return await response.json();
}

// PUBLIC_INTERFACE
/**
 * Gets a list of genres from TMDB, to be filtered for Tamil movies.
 * This is useful for category-based quizzes (e.g. movie bingo).
 * @returns {Promise<Array>} Array of {id, name}
 */
export async function getGenres() {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: TAMIL_LANGUAGE
  });
  const url = `${TMDB_BASE_URL}/genre/movie/list?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch genres");
  const data = await response.json();
  return data.genres;
}
