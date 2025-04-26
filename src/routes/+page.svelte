<script>
    import { onMount } from 'svelte';
    import { tsv } from 'd3';
    import BarChart from '$lib/charts/BarChart.svelte';
    
    
    const sampleData = [25, 80, 15, 60, 20];
    const sampleLabels = ['Abacate', 'Banana', 'Caqui', 'Damasco', 'Estrela'];

    let fullData = [];
    let filteredData = [];
    let filteredLabels = [];

    let selectedCategory = 'all';

    onMount(async () => {
        const data = await tsv('/testdata.tsv', d => ({
            ...d,
            value: +d.value
        }));
        
        fullData = data;
        console.log('Dados carregados:', fullData);
        aplicarFiltro();
    });

    function aplicarFiltro() {
        const dados = selectedCategory === 'all'
            ? fullData
            : fullData.filter(d => d.type === selectedCategory);

        filteredLabels = dados.map(d => d.name);
        filteredData = dados.map(d => d.value);
    }
    
    function handleCategoryChange(event) {
        selectedCategory = event.target.value;
        console.log(`Selected category: ${selectedCategory}`); // Log the selected category
        aplicarFiltro();
        console.log(filteredData); // Log the filtered data after applying the filter
    }
</script>

<main class="container" >
    <h1>Hello World!</h1>
    <p>Exemplos de visualizações</p>

    <h2>Gráfico de Barras com SvelteKit e D3</h2>

    <label>
        Filter:
        <select on:change={handleCategoryChange}>
            <option value="all">All</option>
            <option value="fruit">Fruit</option>
            <option value="car">Car</option>
            <option value="animal">Animal</option>
        </select>
    </label>

    {#if filteredData.length}
        <BarChart data={filteredData} labels={filteredLabels} />
    {:else}
        <p>Carregando ou nenhum dado.</p>
    {/if}   

</main>