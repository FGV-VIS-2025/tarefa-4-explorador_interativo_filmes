<script>
  import { onMount } from 'svelte';
  import { renderBarChart } from '$lib/charts/barChart.js';
  import '$lib/charts/barChart.css';
  import HeatmapOscar from '$lib/charts/HeatmapOscar.svelte';

  onMount(() => {
    renderBarChart('#grafico1');
  });
</script>

<style>
  main {
    padding: 0.5rem 2rem 2rem;
    font-family: system-ui, sans-serif;
    background-color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1, h2 {
    color: white;
    text-align: center;
    margin-bottom: 1rem;
    margin-top: 0;
  }

  .chart-container {
    background-color: black;
    color: white;
    border-radius: 12px;
    box-shadow: none;
    padding: 1rem;
    max-width: 900px;
    width: 100%;
    margin-top: 0;
  }

  select {
    font-size: 16px;
    margin-bottom: 1rem;
  }
</style>

<main>

  <div class="chart-container">
    <h2>Oscar nominations vs Awards received</h2>
    <HeatmapOscar />
  </div>
</main>
