<script>
    import { onMount } from 'svelte';
    import { max, min } from 'd3';
    import noUiSlider from 'nouislider';
    //charts
    import HBarChart from '$lib/charts/hbarchart.svelte';
    //utils
    import {loadMovies} from '$lib/utils/dataLoader';
    import { processBarChartData } from '$lib/utils/dataManipulation.js';


    let fullData = [];
    let genreCounts = {};
    let genres = [];
    let nominations = [];

    let selectedView = 'oscarNominations';
    let flagSum = false;

    let sliderEl;
    let minYear, maxYear, startYear, endYear;

    function updateBarChart() {
        const result = processBarChartData(fullData, startYear, endYear, selectedView, flagSum);
        genres = result.genres;
        nominations = result.nominations;

        console.log('Genres:', genres);
        console.log('Nominations:', nominations);
    }

    onMount(async () => {
        fullData = await loadMovies();
    
        console.log('Loaded data:', fullData);
        console.log('Number of records:', fullData.length);

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
            to: Math.round,
            from: Number
            }
        });

        sliderEl.noUiSlider.on('update', ([low, high]) => {
            startYear = low;
            endYear = high;
            updateBarChart();
        });

        updateBarChart();
    });

    function handleCategoryChange(event) {
        selectedView = event.target.value;
        console.log(`Selected View: ${selectedView}`);
        updateBarChart();
    }
</script>

<main class="container" >
    <label>
        Select view:
        <select on:change={handleCategoryChange}>
            <option value="oscarNominations">Nominations</option>
            <option value="oscarWins">Wins</option>
        </select>
    </label>

    <label>
        <input type="checkbox" bind:checked={flagSum} on:change={updateBarChart} />
        Count unique movies
    </label>  
    
    <div bind:this={sliderEl} class="year-slider"></div>

    {#if nominations.length}
        <HBarChart data={nominations} labels={genres} title="titulo" xLabel="xlabel" yLabel="ylabel" />
    {:else}
        <p>Carregando ou nenhum dado.</p>
    {/if}   

</main>