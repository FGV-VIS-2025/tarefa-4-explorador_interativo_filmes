<script>
  import { onMount } from 'svelte';
  import { renderBarChart } from '$lib/charts/barChart.js';
  import '$lib/charts/barChart.css';
  import ScatterOscar from '$lib/charts/ScatterOscar.svelte';

  onMount(() => {
    renderBarChart('#grafico1');
  });
</script>

<style>
main {
  padding: 0.5rem 2rem 2rem;
  font-family: system-ui, sans-serif;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center; /* centraliza conteúdo */
}

h1, h2 {
  color: #2a2a2a;
  text-align: center;  /* centraliza título */
  margin-bottom: 1rem;
  margin-top: 0; /* remove margem superior */
}

.chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1rem;
  max-width: 750px;     /* reduz largura */
  width: 100%;
  margin-top: 0;      /* sobe mais a caixa */
}


  select {
    font-size: 16px;
    margin-bottom: 1rem;
  }
</style>

<main>

  <div class="chart-container">
    <h2>Indicações ao Oscar vs Prêmios recebidos</h2>
    <ScatterOscar />
  </div>
</main>
