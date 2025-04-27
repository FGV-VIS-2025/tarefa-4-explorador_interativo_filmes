<script>
    import { onMount } from 'svelte';
    import { max, min, tsv } from 'd3';

    import noUiSlider from 'nouislider';

    import BarChart from '$lib/charts/BarChart.svelte';
    import HBarChart from '$lib/charts/hbarchart.svelte';
    

    let fullData = [];
    let genreCounts = {};
    let genres = [];
    let nominations = [];

    let selectedView = 'oscarNominations';
    let flagSum = false;

    let sliderEl;
    let minYear, maxYear, startYear, endYear;

    function processData() {
        const sliceData = fullData.filter(d => d.startYear >= startYear && d.startYear <= endYear);

        genreCounts = {};

        sliceData.forEach(d => { 
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

        console.log('Genres:', genres);
        console.log('Nominations:', nominations);
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
    
        console.log('Loaded data:', data);
        console.log('Number of records:', data.length);

        // Initialize slider
        minYear = min(fullData, d => d.startYear);
        maxYear = max(fullData, d => d.startYear);

        startYear = minYear;
        endYear = maxYear;

        noUiSlider.create(sliderEl, {
            start: [minYear, maxYear],
            connect: true,
            step: 1,
            range: { min: minYear, max: maxYear },
            tooltips: [true, true],
            format: {
            to: v => Math.round(v),
            from: v => Number(v)
            }
        });

        sliderEl.noUiSlider.on('update', ([low, high]) => {
            startYear = low;
            endYear = high;
            processData();
        });

        processData();
    });
    
    function handleCategoryChange(event) {
        selectedView = event.target.value;
        console.log(`Selected View: ${selectedView}`);
        processData();
    }
</script>

<!-- Descomentar se deletar o static/nouislider.css -->
<!-- <svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.8.1/nouislider.min.css"
  />
</svelte:head> -->

<main class="container" >
    <h1>Hello World!</h1>
    <p>Exemplos de visualizações</p>

    <h2>Gráfico de Barras com SvelteKit e D3</h2>

    <label>
        Select view:
        <select on:change={handleCategoryChange}>
            <option value="oscarNominations">Nominations</option>
            <option value="oscarWins">Wins</option>
        </select>
    </label>

    <label>
        <input type="checkbox" bind:checked={flagSum} on:change={processData} />
        Count unique movies
    </label>  
    
    <div bind:this={sliderEl} class="year-slider"></div>

    {#if nominations.length}
        <HBarChart data={nominations} labels={genres} title="titulo" xLabel="xlabel" yLabel="ylabel" />
    {:else}
        <p>Carregando ou nenhum dado.</p>
    {/if}   

</main>