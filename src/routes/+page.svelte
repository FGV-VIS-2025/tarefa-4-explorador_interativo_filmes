<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { max, min } from 'd3';
  import noUiSlider from 'nouislider';

  import HBarChart from '$lib/charts/hbarchart.svelte';
  import BubbleChart from '$lib/charts/bubble.svelte';
  import GrafoPelicula from '$lib/charts/grafo.svelte';
  import DetallePelicula from '$lib/charts/DetallePelicula.svelte';
  import { loadMovies } from '$lib/utils/dataLoader';

  let selectedMovie = null;
  let selectedData  = null;

  // dados completos e controles
  let fullData = [];
  let genreCounts = {};
  let genres = [];
  let nominations = [];

  let selectedView = 'oscarNominations';
  let flagSum = false;

  let sliderEl;
  let minYear, maxYear, startYear, endYear;

  function handleMovieSelected(event) {
    selectedMovie = event.detail.id;
    selectedData  = event.detail.data;
  }

  function volverAlBubbleChart() {
    selectedMovie = null;
    selectedData  = null;
  }

  function processData() {
    const slice = fullData.filter(d => d.startYear >= startYear && d.startYear <= endYear);
    genreCounts = {};

    slice.forEach(d => {
      d.genres.forEach(g => {
        if (!g) return;
        const value = flagSum
          ? ((d[selectedView] || 0) > 0 ? 1 : 0)
          : (d[selectedView] || 0);
        genreCounts[g] = (genreCounts[g] || 0) + value;
      });
    });

    const sorted = Object.entries(genreCounts)
      .map(([genre, value]) => ({ genre, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    genres      = sorted.map(d => d.genre);
    nominations = sorted.map(d => d.value);
  }

  onMount(async () => {
    fullData = await loadMovies();

    // ano mínimo e máximo
    minYear = min(fullData, d => d.startYear);
    maxYear = max(fullData, d => d.startYear);
    startYear = minYear;
    endYear   = maxYear;

    // slider
    noUiSlider.create(sliderEl, {
      start: [minYear, maxYear],
      connect: true,
      step: 1,
      range: { min: minYear, max: maxYear },
      tooltips: [true, true],
      format: { to: Math.round, from: Number }
    });

    sliderEl.noUiSlider.on('update', ([low, high]) => {
      startYear = low;
      endYear   = high;
      processData();
    });

    processData();
  });

  function handleCategoryChange(event) {
    selectedView = event.target.value;
    processData();
  }
</script>

<style>
  .container {
    max-width: 1024px;
    margin: 0 auto;
    padding: 1rem;
  }
  .year-slider {
    margin: 1rem 0;
  }
</style>

{#key selectedMovie}
  {#if !selectedMovie}
    <!-- TELA INICIAL: Barras + BubbleChart -->
    <main class="container">
      <h1 style="text-align: center; color: #ffd700;">Explorador Interactivo de Filmes</h1>

      <section>
        <h2>Gráfico de Barras</h2>
        <label>
          View:
          <select on:change={handleCategoryChange} bind:value={selectedView}>
            <option value="oscarNominations">Nominations</option>
            <option value="oscarWins">Wins</option>
          </select>
        </label>
        <label style="margin-left: 1rem;">
          <input type="checkbox" bind:checked={flagSum} on:change={processData} />
          Count unique movies
        </label>
        <div bind:this={sliderEl} class="year-slider"></div>

        {#if nominations.length}
          <HBarChart
            data={nominations}
            labels={genres}
            title="Top 10 Genres"
            xLabel="Count/Sum"
            yLabel="Genre"
          />
        {:else}
          <p>Carregando ou nenhum dado.</p>
        {/if}
      </section>

      <section style="margin-top: 2rem; text-align: center;">
        <h2 style="color: #ffd700;">Análise de Filmes com BubbleChart</h2>
        <div style="display: flex; justify-content: center; margin-top: 1rem;">
          <BubbleChart on:movieSelected={handleMovieSelected} />
        </div>
        <p style="font-size: 0.9rem; color: #ccc;">
          Clique em uma bolha para explorar a rede de filmes relacionados.
        </p>
      </section>
    </main>
  {:else}
    <!-- TELA DE GRAFO: Grafo + Detalhe -->
    <section class="container" style="padding-top: 2rem;">
      <h2 style="text-align: center; color: #ffd700;">Rede de Filmes Relacionados</h2>
      <div style="display: flex; gap: 2rem; margin-top: 2rem;">
        <div style="flex: 2; min-width: 0;">
          <!-- Passe o ID correto aqui -->
          <GrafoPelicula
            movieId={selectedMovie}
            on:volver={volverAlBubbleChart}
          />
        </div>
        <div style="flex: 1;">
          <DetallePelicula data={selectedData} />
        </div>
      </div>
    </section>
  {/if}
{/key}
