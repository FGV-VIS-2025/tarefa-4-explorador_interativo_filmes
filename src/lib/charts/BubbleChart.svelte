<!-- src/lib/charts/BubbleChart.svelte -->
<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import * as d3 from 'd3';
  import { loadMoviesLastMovies } from '$lib/utils/dataLoader.js';

  const chartConfig = {
        width: 1000,
        height: 700,
        margin: { top: 20, right: 40, bottom: 50, left: 60 }
  };

  const { width, height, margin } = chartConfig;
  const innerWidth  = width  - margin.left - margin.right;
  const innerHeight = height - margin.top  - margin.bottom;

  const dispatch = createEventDispatcher();
 
  let data = [];
  let svgEl;
  let tooltipEl;

  onMount(async () => {
    data = (await loadMoviesLastMovies()).map(d => ({ ...d }));

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.averageRating), d3.max(data, d => d.averageRating)])
      .range([0, innerWidth]);

    const sizeScale = d3.scaleSqrt()
      .domain([d3.min(data, d => d.numVotes), d3.max(data, d => d.numVotes)])
      .range([3, 20]);

    const colorScale = d3.scaleOrdinal()
      .domain([0, 1])
      .range(['#aaa', '#ffd700']);

    data.forEach(d => {
      d.x = xScale(d.averageRating);
      d.y = innerHeight / 2;
      d.radius = sizeScale(d.numVotes);
    });

    const simulation = d3.forceSimulation(data)
      .force("x", d3.forceX(d => d.x).strength(1))
      .force("y", d3.forceY(innerHeight / 2).strength(0.05))
      .force("collision", d3.forceCollide().radius(d => d.radius + 2))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const svg = d3.select(svgEl)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select(tooltipEl);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius)
      .attr('fill', d => colorScale(d.oscarWins > 0 ? 1 : 0))
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, d) => {
        tooltip
          .style("display", "block")
          .html(`<strong>${d.primaryTitle}</strong>`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style("display", "none");
      })
      .on('click', (event, d) => {
        dispatch('movieSelected', { id: d.tconst, data: d });
      });

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append('text')
      .attr('class', 'x label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('fill', '#ffd700')
      .text('Average Rating (IMDb)');
  });
</script>

<div class="chart-container">
  <svg bind:this={svgEl} class="bubble-chart"></svg>
  <div bind:this={tooltipEl} class="tooltip-bubble" style="position: absolute; display: none;"></div>
</div>
