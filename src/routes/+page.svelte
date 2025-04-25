<script>
    import BarChart from '$lib/charts/BarChart.svelte';
  
    const sampleData = [25, 80, 15, 60, 20];
    const sampleLabels = ['Abacate', 'Banana', 'Caqui', 'Damasco', 'Estrela'];
</script>

<main class="container">
    <h1>Hello World!</h1>
    <p>Exemplos de visualizações</p>

    <h2>Gráfico de Barras com SvelteKit e D3</h2>
    
    <BarChart data={sampleData} labels={sampleLabels} />

</main>
  
  