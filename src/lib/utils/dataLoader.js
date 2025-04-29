// src/lib/utils/dataloader.js
import { tsv } from 'd3';

let cachedMovies = null;

export async function loadMovies() {
	if (cachedMovies) {
		return cachedMovies;
		console.log('Using cached movies data');
	}

	// const data = await tsv('/data/last1000filmes.tsv', tsv.autoType);
	const data = await tsv('/data/last1000filmes.tsv', row => ({
        ...row,
        averageRating: +row.averageRating,
        numVotes: +row.numVotes,
        oscarNominations: +row.oscarNominations,
        oscarWins: +row.oscarWins,
    }));

	cachedMovies = data;
	console.log('Loaded movies data from TSV file');
	return cachedMovies;
}
