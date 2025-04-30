<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { loadGraph, loadMovies } from '$lib/utils/dataLoader.js';

  let graphData = null;
  let width = 1000;
  let height = 600;
  let svgElement;

  export let movieId;
  const dispatch = createEventDispatcher();

  onMount(async () => {
    const graph = await loadGraph();
    const movies = await loadMovies();

    const movieMap = new Map(movies.map(movie => [movie.tconst, movie]));

    graph.nodes = graph.nodes.map(node => {
      const movieData = movieMap.get(node.id);
      return movieData ? { ...node, ...movieData } : node;
    });

    graphData = graph;

    if (movieId) {
      drawFromMovieId(movieId);
    }
  });

  function drawFromMovieId(movieId) {
    const node = graphData.nodes.find(d => d.id === movieId);
    if (!node) return;

    const componentId = node.component;
    const nodesInComponent = graphData.nodes.filter(d => d.component === componentId);
    const nodeIdsInComponent = new Set(nodesInComponent.map(d => d.id));

    let linksInComponent = graphData.links.filter(d =>
      nodeIdsInComponent.has(d.source) && nodeIdsInComponent.has(d.target)
    ).map(d => ({
      source: typeof d.source === 'object' ? d.source.id : d.source,
      target: typeof d.target === 'object' ? d.target.id : d.target,
      weight: d.weight
    }));

    const adjacency = new Map();
    for (const node of nodesInComponent) {
      adjacency.set(node.id, []);
    }
    for (const link of linksInComponent) {
      adjacency.get(link.source).push(link.target);
      adjacency.get(link.target).push(link.source);
    }

    const visited = new Set([movieId]);
    const queue = [movieId];
    const resultNodes = new Set([movieId]);

    while (queue.length > 0 && resultNodes.size < 40) {
      const current = queue.shift();
      for (const neighbor of adjacency.get(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          resultNodes.add(neighbor);
          if (resultNodes.size >= 40) break;
          queue.push(neighbor);
        }
      }
    }

    const nodes = graphData.nodes.filter(d => resultNodes.has(d.id));
    const nodeIds = new Set(nodes.map(d => d.id));

    const links = graphData.links.filter(d =>
      nodeIds.has(d.source) && nodeIds.has(d.target)
    ).map(d => ({
      source: typeof d.source === 'object' ? d.source.id : d.source,
      target: typeof d.target === 'object' ? d.target.id : d.target,
      weight: d.weight
    }));

    const filteredGraph = { nodes, links };
    drawGraph(filteredGraph);
  }

  function drawGraph(graph) {
    d3.select('svg').selectAll('*').remove();

    const svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height);

    const sizeScale = d3.scaleLinear()
      .domain([
        d3.min(graph.nodes, d => +d.averageRating || 0),
        d3.max(graph.nodes, d => +d.averageRating || 1)
      ])
      .range([5, 20]);

    const colorScale = d3.scaleOrdinal()
      .domain([0, 1])
      .range(['#aaa', '#ffd700']); // gris para 0 Oscars, dorado para 1+

    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(graph.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.weight || 1))
      .attr('stroke', '#999');

    const node = svg.append('g')
      .selectAll('circle')
      .data(graph.nodes)
      .join('circle')
      .attr('r', d => isNaN(d.averageRating) ? 5 : sizeScale(d.averageRating))
      .attr('fill', d => colorScale(d.oscarWins > 0 ? 1 : 0))
      .attr('stroke', d => d.id === movieId ? 'black' : null)
      .attr('stroke-width', d => d.id === movieId ? 3 : 0)
      .call(drag(simulation));

    const tooltip = d3.select("#tooltip");

    node.on('mouseover', (event, d) => {
      tooltip
        .style("display", "block")
        .html(`<strong>${d.primaryTitle || d.title || 'Sin título'}</strong><br/>
              Ganó Óscar: ${d.oscarWins > 0 ? 'Sí' : 'No'}<br/>
              Rating: ${d.averageRating || 'N/A'}<br/>
              Género: ${d.genres || 'N/A'}<br/>
              Director(es): ${d.directors || 'N/A'}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on('mouseout', () => {
      tooltip.style("display", "none");
    });

    simulation.on('tick', () => {
      graph.nodes.forEach(d => {
        const r = isNaN(d.averageRating) ? 5 : sizeScale(d.averageRating);
        d.x = Math.max(r, Math.min(width - r, d.x));
        d.y = Math.max(r, Math.min(height - r, d.y));
      });

      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
  }

  function drag(simulation) {
    return d3.drag()
      .on('start', event => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', event => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on('end', event => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });
  }

  function volver() {
    dispatch('volver');
  }
</script>

<button on:click={volver} 
  style="margin: 1rem 0; background-color: #695a03; padding: 0.5rem 1rem; border: none; cursor: pointer; border-radius: 5px;">
  Volver
</button>


<svg></svg>

<div
  id="tooltip"
  style="
    position: absolute;
    display: none;
    background: white;
    border: 1px solid #ccc;
    padding: 5px;
    pointer-events: none;
    color: #000;
    border-radius: 4px;
    font-size: 12px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    z-index: 10;">
</div>
