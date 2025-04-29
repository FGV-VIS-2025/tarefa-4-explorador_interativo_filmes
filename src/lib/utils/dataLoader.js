// src/lib/utils/dataLoader.js
import { tsv } from 'd3';

export async function loadMovies() {
    return await tsv('/title_oscar.tsv', row => ({
        ...row,
        startYear: +row.startYear,
        runtimeMinutes: +row.runtimeMinutes,
        averageRating: +row.averageRating,
        numVotes: +row.numVotes,
        oscarNominations: +row.oscarNominations,
        oscarWins: +row.oscarWins,
        genres: row.genres ? row.genres.split(',') : []
    }));
}