<script>
  import { onMount } from 'svelte';
  import { renderBarChart } from '$lib/charts/barChart.js';
  import '$lib/charts/barChart.css';
  import ScatterOscar from '$lib/bloques/ScatterOscar.svelte';

  onMount(() => {
    renderBarChart('#grafico1');
  });
</script>

<style>
  main {
    padding: 2rem;
    font-family: system-ui, sans-serif;
    background-color: #f5f5f5;
  }

  h1 {
    color: #2a2a2a;
  }

  .chart-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 1rem;
    max-width: 900px;
    margin: 2rem auto;
  }

  select {
    font-size: 16px;
    margin-bottom: 1rem;
  }
</style>

<main>
  <h1>Esqueleto da Visualización</h1>

  <div class="chart-container">
    <h2>Gráfico de Indicações vs Prêmios (Oscar)</h2>
    <ScatterOscar />
  </div>
</main>
