<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let svgRef;
    let legendRef;
    let selectedCell = null;
    let tooltipMovies = [];
    let selectedGenre = 'all';
    let allGenres = [];
  
    const height = 500;
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };
    const cellSize = 30;
  
    let width = 700;
    let data = [];
    let matrix = new Map();
    let globalMaxX = 0;
    let globalMaxY = 0;
  
    onMount(async () => {
      const rawData = await d3.tsv("/static/title_oscar.tsv");
  
      data = rawData.map(d => ({
        ...d,
        oscarNominations: +d.oscarNominations,
        oscarWins: +d.oscarWins,
        genre: d.genres && d.genres !== "\\N" ? d.genres.split(",")[0] : "Other"
      }));
  
      const genreSet = new Set(data.map(d => d.genre));
      allGenres = ['all', ...Array.from(genreSet).sort()];
  
      globalMaxX = d3.max(data, d => d.oscarNominations) || 1;
      globalMaxY = d3.max(data, d => d.oscarWins) || 1;
  
      width = margin.left + margin.right + cellSize * (globalMaxX + 1);
  
      updateMatrix();
      drawHeatmap();
    });
  
    function updateMatrix() {
      const filtered = selectedGenre === 'all' ? data : data.filter(d => d.genre === selectedGenre);
  
      matrix = d3.rollup(
        filtered,
        v => v,
        d => d.oscarNominations,
        d => d.oscarWins
      );
    }
  
    function drawHeatmap() {
      const svg = d3.select(svgRef)
        .attr("width", width)
        .attr("height", height);
  
      svg.selectAll("*").remove();
  
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const xScale = d3.scaleLinear().domain([0, globalMaxX]).range([0, cellSize * (globalMaxX + 1)]);
      const yScale = d3.scaleLinear().domain([0, globalMaxY]).range([cellSize * (globalMaxY + 1), 0]);
  
      const maxCount = d3.max([...matrix.values()].flatMap(m => [...m.values()].map(g => g.length))) || 1;
  
      const thresholds = [
        maxCount * 0.0018,
        maxCount * 0.02,
        maxCount * 0.05,
        maxCount * 0.9
      ];
  
      const colorScale = d3.scaleThreshold()
        .domain(thresholds)
        .range([
            "#ccffcc", // verde bem claro
            "#66ff66", // verde suave
            "#00ff00", // verde neon
            "#009900", // verde forte
            "#004d00"  // verde escuro
        ]);
  
      for (const [n, inner] of matrix.entries()) {
        for (const [w, films] of inner.entries()) {
          g.append("rect")
            .attr("x", xScale(n))
            .attr("y", yScale(w) - cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colorScale(films.length))
            .attr("stroke", "#ccc")
            .on("click", () => {
              selectedCell = { n, w };
              tooltipMovies = films;
            });
        }
      }
  
      const xAxis = d3.axisBottom(xScale).ticks(globalMaxX).tickFormat(d3.format("d"));
      const yAxis = d3.axisLeft(yScale).ticks(globalMaxY).tickFormat(d3.format("d"));
  
      g.append("g")
        .attr("transform", `translate(0, ${cellSize * (globalMaxY + 1)})`)
        .call(xAxis)
        .selectAll("text").style("fill", "white");
  
      g.append("g")
        .call(yAxis)
        .selectAll("text").style("fill", "white");
  
      g.selectAll(".domain, .tick line")
        .attr("stroke", "white");
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 30)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .text("Oscar nominations");
  
      svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .text("Awards Received");
  
      // ===== LEGENDA CATEGÓRICA =====
      const legendData = thresholds.map((t, i) => ({
        label: i === 0
          ? `≤ ${Math.round(t)}`
          : `${Math.round(thresholds[i - 1]) + 1} – ${Math.round(t)}`,
        color: colorScale(t - 1)
      }));
  
      legendData.push({
        label: `≥ ${Math.round(thresholds[thresholds.length - 1] + 1)}`,
        color: colorScale(maxCount)
      });
  
      const legendSvg = d3.select(legendRef)
        .attr("width", 300)
        .attr("height", 60)
        .style("margin-top", "1rem");
  
      legendSvg.selectAll("*").remove();
  
      legendSvg.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 55)
        .attr("y", 10)
        .attr("width", 50)
        .attr("height", 15)
        .attr("fill", d => d.color)
        .attr("stroke", "white");
  
      legendSvg.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 55 + 25)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "10px")
        .text(d => d.label);

      legendSvg.append("text")
        .attr("x", 150) // centraliza horizontalmente
        .attr("y", 50)  // posiciona abaixo da legenda
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "12px")
        .text("Amount of movies");

    }
  
    function onGenreChange(event) {
      selectedGenre = event.target.value;
      selectedCell = null;
      tooltipMovies = [];
      updateMatrix();
      drawHeatmap();
    }
  </script>
  
  <style>
    .heatmap-container {
      display: flex;
      flex-direction: column;
    }
  
    .filter-row {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 1rem;
    }
  
    .filter-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  
    .heatmap-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
  
    svg {
      flex-shrink: 0;
      width: auto;
    }
  
    .movie-list {
      font-size: 14px;
      max-height: 500px;
      overflow-y: auto;
      border-left: 1px solid #888;
      padding-left: 1rem;
      width: 250px;
    }
  
    .legend-svg {
      width: 300px;
      height: 60px;
    }
  </style>
  
  <div class="heatmap-container">
    <div class="filter-row">
      <div class="filter-controls">
        <label for="genre">Genre:</label>
        <select id="genre" on:change={onGenreChange} bind:value={selectedGenre}>
          {#each allGenres as genre}
            <option value={genre}>{genre}</option>
          {/each}
        </select>
      </div>
      <svg bind:this={legendRef} class="legend-svg"></svg>
    </div>
  
    <div class="heatmap-row">
      <svg bind:this={svgRef}></svg>
  
      {#if selectedCell}
        <div class="movie-list">
          <strong>{tooltipMovies.length} movies with {selectedCell.n} nominations and {selectedCell.w} awards:</strong>
          <ul>
            {#each tooltipMovies as film}
              <li>{film.primaryTitle} ({film.startYear}) – Nota: {film.averageRating}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
  