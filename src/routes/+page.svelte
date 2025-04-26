<script>
    import { onMount } from 'svelte';
    import { tsv } from 'd3';
    import BarChart from '$lib/charts/BarChart.svelte';

    let fullData = [];
    let genreCounts = {};
    let genres = [];
    let nominations = [];

    let selectedCategory = 'all';
    let flagSum = false;

    function processData() {
        genreCounts = {};

        fullData.forEach(d => {
            d.genres.forEach(genre => {
                if (genre) {
                    if (flagSum) {
                        genreCounts[genre] = (genreCounts[genre] || 0) + 1; // Conta filmes
                    } else {
                        genreCounts[genre] = (genreCounts[genre] || 0) + d.oscarNominations; // Soma indicações
                    }
                }
            });
        });

        genres = Object.keys(genreCounts);
        nominations = Object.values(genreCounts);
    }

    onMount(async () => {
        const data = await tsv('/title_oscar.tsv', d => ({
            ...d,
            oscarNominations: +d.oscarNominations,
            genres: d.genres ? d.genres.split(',') : []
        }));
        fullData = data;
        console.log('Dados carregados:', data);
        console.log('Número de dados:', data.length);

        processData();
        console.log('Gêneros:', genres);
        console.log('Indicações:', nominations);
    });

    // function aplicarFiltro() {
    //     const dados = selectedCategory === 'all'
    //         ? fullData
    //         : fullData.filter(d => d.type === selectedCategory);

    //     filteredLabels = dados.map(d => d.name);
    //     filteredData = dados.map(d => d.value);
    // }
    
    function handleCategoryChange(event) {
        selectedCategory = event.target.value;
        console.log(`Selected category: ${selectedCategory}`); // Log the selected category
        // aplicarFiltro();
        // console.log(filteredData); // Log the filtered data after applying the filter
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

    <label>
        <input type="checkbox" bind:checked={flagSum} on:change={processData} />
        Contar apenas quantidade de filmes (não somar indicações)
    </label>    

    {#if nominations.length}
        <BarChart data={nominations} labels={genres} />
    {:else}
        <p>Carregando ou nenhum dado.</p>
    {/if}   

</main>