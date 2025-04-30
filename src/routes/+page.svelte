<!-- routes/+page.svelte -->
<script>
  // Svelte imports
  import { onMount, afterUpdate } from 'svelte';
  import { max, min } from 'd3';
  // charts
  import HBarChart from '$lib/charts/HBarChart.svelte';
  import BubbleChart from '$lib/charts/BubbleChart.svelte';
  import FilmNetwork from '$lib/charts/FilmNetwork.svelte';
  import FilmDetails from '$lib/charts/FilmDetails.svelte';
  // components
  import Slider from '$lib/components/Slider.svelte';
  // utils
  import { loadMoviesFullData } from '$lib/utils/dataLoader';
  import { processBarChartData } from '$lib/utils/dataManipulation.js';

  let fullData = [];
  let genres = [];
  let nominations = [];

  let selectedView = 'oscarNominations';
  let flagSum = false;

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

{#if !selectedMovie}
  {#key selectedMovie}
    <main class="home-container">
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

      <Slider
        min={minYear}
        max={maxYear}
        start={startYear}
        end={endYear}
        on:rangeChanged={(e) => {
          startYear = e.detail.start;
          endYear = e.detail.end;
          updateBarChart();
        }}
      />

      {#if nominations.length}
        <div class="chart-container">
          <HBarChart
            data={nominations}
            labels={genres}
            title="Movies by Genre"
            xLabel="Number of indications/movies"
            yLabel="Genre"
          />
        </div>
      {:else}
        <p>Loading data or no data available.</p>
      {/if}

      <h2>Analysis of movies based on ratings and Oscar awards</h2>

      <div class="bubble-container">
        <BubbleChart on:movieSelected={handleMovieSelected} />
      </div>

      <div class="instructions">
        Click on a bubble to explore the network of related movies.
      </div>
    </main>
  {/key}
{:else}
  <h2>Movies Network</h2>
  <div class="network-view">
    <div class="graph-container">
      <FilmNetwork movieId={selectedMovie} on:volver={BackInitialView} />
    </div>
    <div class="film-details">
      <FilmDetails data={selectedData} />
    </div>
  </div>
{/if}
