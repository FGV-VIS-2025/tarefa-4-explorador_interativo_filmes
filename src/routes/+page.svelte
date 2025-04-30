<!-- +page.svelte -->
<script>
  // Svelte imports
  import { onMount } from 'svelte';
  import { max, min } from 'd3';
  import noUiSlider from 'nouislider';
  // charts
  import HBarChart from '$lib/charts/HBarChart.svelte';
  import BubbleChart from '$lib/charts/BubbleChart.svelte';
  import FilmNetwork from '$lib/charts/FilmNetwork.svelte';
  import FilmDetails from '$lib/charts/FilmDetails.svelte';
  // utils
  import { loadMoviesFullData } from '$lib/utils/dataLoader';
  import { processBarChartData } from '$lib/utils/dataManipulation.js';

  let fullData = [];
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
    fullData = await loadMoviesFullData();

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
    
  // Bubble chart and network chart
  let selectedMovie = null;
  let selectedData = null;

  function handleMovieSelected(event) {
    selectedMovie = event.detail.id;
    selectedData = event.detail.data;
    console.log(`Selected Movie ID: ${selectedMovie}`);
  }

  function BackInitialView() {
    console.log('Back to Bubble Chart');
    selectedMovie = null;
    selectedData = null;
  }
</script>

<h1 style="text-align: center; color: #ffd700;">Interactive Movie Explorer</h1>
<h3 style="text-align: center; color: #ffd700;">Datasets: IMDB and Oscar database</h3>

<!-- First view -->
{#if !selectedMovie}
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
        <HBarChart data={nominations} labels={genres} title="titulo" xLabel="Number of indications/movies" yLabel="Genre" />
    {:else}
        <p>Carregando ou nenhum dado.</p>
    {/if}   

  </main>
  <h2 style="text-align: center; color: #ffd700;">Analysis of movies based on ratings and Oscar awards</h2>

  <div style="display: flex; justify-content: center; margin-top: 2rem;">
    <BubbleChart on:movieSelected={handleMovieSelected} />
  </div>

  <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: #ccc;">
    Click on a bubble to explore the network of related movies.
  </div>
{/if}

<!-- Second view -->
{#if selectedMovie}
  <h2 style="text-align: center; color: #ffd700;">Movies Network</h2>

  <div style="display: flex; margin-top: 2rem; gap: 2rem; justify-content: center;">
    <div style="flex: 2; max-width: 60%;">
      <FilmNetwork movieId={selectedMovie} on:volver={BackInitialView} />
    </div>
    <div style="flex: 1;">
      <FilmDetails data={selectedData} />
    </div>
  </div>
{/if}