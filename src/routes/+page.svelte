<script>
    import { onMount } from 'svelte';
    import { tsv } from 'd3';
    import BarChart from '$lib/charts/BarChart.svelte';

    let fullData = [];
    let genreCounts = {};
    let genres = [];
    let nominations = [];

    let selectedView = 'oscarNominations';
    let flagSum = false;

    function processData() {
        genreCounts = {};

        fullData.forEach(d => {
            d.genres.forEach(genre => {
                if (genre) {
                    if (flagSum) {
                        genreCounts[genre] = (genreCounts[genre] || 0) + ((d[selectedView] || 0) > 0 ? 1 : 0); // Count
                    } else {
                        genreCounts[genre] = (genreCounts[genre] || 0) + (d[selectedView] || 0); // Sum
                    }
                }
            });
        });

        genres = Object.keys(genreCounts);
        nominations = Object.values(genreCounts);

        const sorted = genres
            .map((genre, i) => ({ genre, value: nominations[i] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10

        genres = sorted.map(d => d.genre);
        nominations = sorted.map(d => d.value);

        console.log('Gêneros:', genres);
        console.log('Indicações:', nominations);
    }

    onMount(async () => {
        const data = await tsv('/title_oscar.tsv', d => ({
            ...d,
            startYear: +d.startYear,
            runtimeMinutes: +d.runtimeMinutes,
            averageRating: +d.averageRating,
            numVotes: +d.numVotes,
            oscarNominations: +d.oscarNominations,
            oscarWins: +d.oscarWins,
            genres: d.genres ? d.genres.split(',') : []
        }));
        fullData = data;
        console.log('Dados carregados:', data);
        console.log('Número de dados:', data.length);

        processData();
    });
    
    function handleCategoryChange(event) {
        selectedView = event.target.value;
        console.log(`Selected View: ${selectedView}`);
        processData();
    }
</script>

<main class="container" >
    <h1>Hello World!</h1>
    <p>Exemplos de visualizações</p>

    <h2>Gráfico de Barras com SvelteKit e D3</h2>

    <label>
        Filter:
        <select on:change={handleCategoryChange}>
            <option value="oscarNominations">Nominations</option>
            <option value="oscarWins">Wins</option>
        </select>
    </label>

    <label>
        <input type="checkbox" bind:checked={flagSum} on:change={processData} />
        Contar apenas quantidade de filmes (não somar indicações)
    </label>    

    {#if nominations.length}
        <BarChart data={nominations} labels={genres} />
    {:else}
        <p>Carregando ou nenhum dado.</p>
    {/if}   

</main>