// src/lib/utils/dataloader.js
import { tsv } from 'd3';
import { base } from '$app/paths';

let cachedMovies = null;

export async function loadMovies() {
	if (cachedMovies) {
		console.log('Using cached movies data');
		return cachedMovies;
	}

	const data = await tsv(`${base}/data/last1000filmes.tsv`, row => ({
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

let cachedGraph = null;

export async function loadGraph() {
  if (cachedGraph) {
	console.log('Using cached graph data');
	return cachedGraph;
  }

  const res = await fetch(`${base}/data/grafo_peliculas.json`);
  cachedGraph = await res.json();
  console.log('Loaded graph data from JSON file');
  return cachedGraph;
}