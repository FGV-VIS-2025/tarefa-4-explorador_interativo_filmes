<!-- routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
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
  let wins_genres = [], wins_values = [];
  let nominations_genres = [], nominations_values = [];

  let flagSum = false;

  let minYear, maxYear, startYear, endYear;

  function updateBarChart() {
    const result1 = processBarChartData(fullData, startYear, endYear, 'oscarNominations', flagSum);
    nominations_genres = result1.genres;
    nominations_values = result1.values;

    const result2 = processBarChartData(fullData, startYear, endYear, 'oscarWins', flagSum);
    wins_genres = result2.genres;
    wins_values = result2.values;
  }

  onMount(async () => {
    fullData = await loadMoviesFullData();

    minYear = min(fullData, d => d.startYear);
    maxYear = max(fullData, d => d.startYear);
    startYear = minYear;
    endYear = maxYear;

    updateBarChart();
  });

  let selectedMovie = null;
  let selectedData = null;

  function handleMovieSelected(event) {
    selectedMovie = event.detail.id;
    selectedData = event.detail.data;
  }

  function BackInitialView() {
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
        <input type="checkbox" bind:checked={flagSum} on:change={updateBarChart} />
        Count unique movies
      </label>
      
      <p style="
        text-align: center;
        color: #aaa;
        font-size: 0.85rem;
        margin-top: 0.5rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      ">
      When enabled, each film is counted only once per genre, even if it has received multiple nominations or awards. When disabled, multiple nominations or wins for the same film are added together.
      </p>
      

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

      {#if nominations_genres.length && wins_genres.length}
      <div class="chart-pair-container">
        <div class="chart-container" style="flex-direction: column;">
          <HBarChart
            data={nominations_values}
            labels={nominations_genres}
            title="Movies by Genre"
            xLabel="Number of Nominations"
            yLabel="Genre"
          />
          <p style="
            text-align: center;
            color: #ccc;
            font-size: 0.9rem;
            margin-top: 0.75rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          ">
          This chart shows the distribution of films by genre based on the number of Oscar nominations, among the selected years.
          </p>
        </div>
      
        <div class="chart-container" style="flex-direction: column;">
          <HBarChart
            data={wins_values}
            labels={wins_genres}
            title="Movies by Genre"
            xLabel="Number of Wins"
            yLabel="Genre"
          />
          <p style="
            text-align: center;
            color: #ccc;
            font-size: 0.9rem;
            margin-top: 0.75rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          ">
          This chart shows the distribution of films by genre based on the number of Oscar wins, between selected years.
          </p>
        </div>
      </div>      
      {:else}
        <p>Loading data or no data available.</p>
      {/if}

      <h2>Analysis of movies based on ratings and Oscar awards</h2>

      <div class="bubble-container" style="flex-direction: column;">
        <BubbleChart on:movieSelected={handleMovieSelected} />
      
        <p style="
          text-align: center;
          color: #ccc;
          font-size: 0.9rem;
          margin-top: 0.75rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        ">
        This bubble chart plots movies based on their average IMDb rating and the number of Oscars they've received. The size of the bubble indicates the number of nominations (which is a measure of the movie's popularity). Click on a bubble to explore related movies.
        </p>
      </div>      
    </main>
  {/key}
{:else}
  <h2>Movies Network</h2>
  <div class="network-view">
    <div class="graph-container" style="flex-direction: column;">
      <FilmNetwork movieId={selectedMovie} on:volver={BackInitialView} />
  
      <p style="
        text-align: center;
        color: #ccc;
        font-size: 0.9rem;
        margin-top: 0.75rem;
        max-width: 700px;
        margin-left: auto;
        margin-right: auto;
      ">
      This graph shows the movies connected to the selected title (node ​​with black border) based on similarities in genre, release year, and award history. The structure reveals how movies with similar characteristics cluster together.
      </p>
    </div>
  
    <div class="film-details">
      <FilmDetails data={selectedData} />
    </div>
  </div>
  
{/if}
