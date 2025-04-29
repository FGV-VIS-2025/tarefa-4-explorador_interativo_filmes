<script>
  import BubbleChart from '$lib/charts/BubbleChart.svelte';
  import FilmNetwork from '$lib/charts/FilmNetwork.svelte';
  import FilmDetails from '$lib/charts/FilmDetails.svelte';

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

<h1 style="text-align: center; color: #ffd700;">Explorador Interactivo de Filmes</h1>

{#if !selectedMovie}
  <h2 style="text-align: center; color: #ffd700;">Análise de filmes com base em classificações e prêmios</h2>

  <div style="display: flex; justify-content: center; margin-top: 2rem;">
    <BubbleChart on:movieSelected={handleMovieSelected} />
  </div>

  <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: #ccc;">
    Click on a bubble to explore the network of related movies.
  </div>
{/if}

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
