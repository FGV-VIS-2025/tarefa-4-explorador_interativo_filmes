<script>
  import { onMount, tick } from 'svelte';
  import * as d3 from 'd3';

  let data = [];
  let genres = [];
  let selectedGenre = 'all';
  let filteredData = [];
  let svgRef;
  let currentX, currentY;
  let currentZoomFactor = 1;

  // Escala de cores no escopo global
  const colorScale = d3.scaleOrdinal([
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173',
  '#5254a3', '#9c9ede', '#e6550d', '#31a354', '#756bb1',
  '#636363', '#9e9ac8'
]);


  // Dados filtrados com base no gênero selecionado
  $: filteredData = selectedGenre === 'all'
    ? data
    : data.filter(d => d.genres && d.genres.split(',')[0] === selectedGenre);

  // Extrair gêneros assim que os dados forem carregados
  $: if (data.length > 0) {
    const genreSet = new Set();
    for (const d of data) {
      if (d.genres && d.genres !== "\\N") {
        genreSet.add(d.genres.split(',')[0]);
      }
    }
    genres = Array.from(genreSet).sort();
  }

  // Redesenhar pontos toda vez que o filtro mudar
  $: if (filteredData.length > 0 && currentX && currentY) {
    tick().then(() => drawPoints(currentX, currentY));
  }

  function drawPoints(xScale, yScale, dataset = filteredData) {
    const svg = d3.select(svgRef);
    const g = svg.select("g.data-layer");

    function getColor(d) {
      if (selectedGenre === 'all') {
        return colorScale(d.genres ? d.genres.split(',')[0] : "Other");
      } else {
        return colorScale(selectedGenre);
      }
    }

    const circles = g.selectAll("circle").data(dataset, d => d.tconst);

    circles.join(
      enter => enter.append("circle")
        .attr("r", 4)
        .attr("fill", getColor)
        .attr("cx", d => xScale(d.oscarNominations) + d.jitterX * Math.pow(currentZoomFactor, 1.5) * 8)
        .attr("cy", d => yScale(d.oscarWins) + d.jitterY * Math.pow(currentZoomFactor, 1.5) * 8)
        .on("mouseover", (event, d) => {
          d3.select(".tooltip")
            .style("opacity", 1)
            .html(`
              <strong>${d.primaryTitle}</strong><br>
              Indicações: ${d.oscarNominations}<br>
              Prêmios: ${d.oscarWins}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => {
          d3.select(".tooltip").style("opacity", 0);
        }),
      update => update
        .attr("fill", getColor)
        .attr("cx", d => xScale(d.oscarNominations) + d.jitterX * Math.pow(currentZoomFactor, 1.5) * 8)
        .attr("cy", d => yScale(d.oscarWins) + d.jitterY * Math.pow(currentZoomFactor, 1.5) * 8),
      exit => exit.remove()
    );
  }

  onMount(async () => {
    const margin = { top: 10, right: 40, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 430 - margin.top - margin.bottom;

    const svg = d3.select(svgRef)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.selectAll("*").remove();

    svg.append("g").attr("class", "data-layer")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("clip-path", "url(#clip)");

    // Label do eixo X
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + (width / 2))
      .attr("y", height + margin.top + 40)
      .text("Indicações ao Oscar");

    // Label do eixo Y
    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${margin.left - 45}, ${margin.top + height / 2}) rotate(-90)`)
      .text("Prêmios recebidos");
      

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    currentX = x;
    currentY = y;

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(${margin.left},${height + margin.top})`);

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("font-size", "12px")
      .style("padding", "6px")
      .style("pointer-events", "none");

    const rawData = await d3.tsv("/static/title_oscar.tsv");
    data = rawData.filter(d => d.oscarNominations && d.oscarWins).map(d => ({
      ...d,
      oscarNominations: +d.oscarNominations,
      oscarWins: +d.oscarWins,
      jitterX: (Math.random() - 0.5),
      jitterY: (Math.random() - 0.5)
    }));

    x.domain([0, d3.max(data, d => d.oscarNominations) + 1]);
    y.domain([0, d3.max(data, d => d.oscarWins) + 1]);
    svg.select(".x-axis").call(d3.axisBottom(x));
    svg.select(".y-axis").call(d3.axisLeft(y));
    drawPoints(x, y, data);

    const zoom = d3.zoom()
      .scaleExtent([1, 50])
      .on("zoom", event => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);
        currentX = newX;
        currentY = newY;
        currentZoomFactor = event.transform.k;

        svg.select(".x-axis").call(d3.axisBottom(newX));
        svg.select(".y-axis").call(d3.axisLeft(newY));
        drawPoints(newX, newY);
      });

    svg.call(zoom);
  });
</script>

<style>
  select {
    font-size: 16px;
    padding: 8px;
    margin-bottom: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  .tooltip {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    font-size: 12px;
    padding: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .legend-wrapper {
  margin: 4px 0 10px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.legend-color {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  border-radius: 3px;
  border: 1px solid #333;
  display: inline-block;
}

</style>

<label for="genre">Filtrar por gênero:</label>
<select id="genre" bind:value={selectedGenre}>
  <option value="all">Todos</option>
  {#each genres as genre}
    <option value={genre}>{genre}</option>
  {/each}
</select>

<div class="legend-wrapper">
  <div class="legend">
    {#each genres as genre}
      <div class="legend-item">
        <span class="legend-color" style="background-color: {colorScale(genre)};"></span>
        <span class="legend-label">{genre}</span>
      </div>
    {/each}
  </div>
</div>

<svg bind:this={svgRef}></svg>
