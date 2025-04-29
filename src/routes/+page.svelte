<script>
  import BubbleChart from '$lib/charts/bubble.svelte';
  import GrafoPelicula from '$lib/charts/grafo.svelte';
  import DetallePelicula from '$lib/charts/DetallePelicula.svelte';

  let selectedMovie = null;
  let selectedData = null;

  function handleMovieSelected(event) {
    selectedMovie = event.detail.id;
    selectedData = event.detail.data;
  }

  function volverAlBubbleChart() {
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
    Clique em uma bolha para explorar a rede de filmes relacionados.
  </div>
{/if}

{#if selectedMovie}
  <h2 style="text-align: center; color: #ffd700;">Rede de Filmes Relacionados</h2>

  <div style="display: flex; margin-top: 2rem; gap: 2rem; justify-content: center;">
    <div style="flex: 2; max-width: 60%;">
      <GrafoPelicula movieId={selectedMovie} on:volver={volverAlBubbleChart} />
    </div>
    <div style="flex: 1;">
      <DetallePelicula data={selectedData} />
    </div>
  </div>
{/if}
