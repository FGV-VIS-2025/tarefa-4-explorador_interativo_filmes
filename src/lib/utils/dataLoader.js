// src/lib/utils/dataLoader.js
import { tsv } from 'd3';
import { base } from '$app/paths';

let cachedMoviesData = null;

export async function loadMovies() {
	if (cachedMoviesData) {
		console.log('Using cached movies data:', cachedMoviesData.length, 'rows');
		return cachedMoviesData;
	}

	const data = await tsv(`${base}/data/title_oscar.tsv`, row => ({
		...row,
		startYear: +row.startYear,
		runtimeMinutes: +row.runtimeMinutes,
		averageRating: +row.averageRating,
		numVotes: +row.numVotes,
		oscarNominations: +row.oscarNominations,
		oscarWins: +row.oscarWins,
		genres: row.genres ? row.genres.split(',') : []
	}));

	console.log('Loaded movies data:', data.length, 'rows');
	cachedMoviesData = data;
	return cachedMoviesData;
}