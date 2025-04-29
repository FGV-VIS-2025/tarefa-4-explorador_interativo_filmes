<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let grafoCompleto = null;
  let graphData = null;
  let width = 1000;
  let height = 600;
  let svgElement;

  export let movieId;
  const dispatch = createEventDispatcher();

  onMount(async () => {
    const res = await fetch('/data/grafo_peliculas.json');
    grafoCompleto = await res.json();
    graphData = grafoCompleto;

    // Se já existir um movieId no carregamento, desenha direto
    if (movieId) {
      drawFromMovieId(movieId);
    }
  });

  // Quando movieId mudar e o grafo já estiver carregado
  $: if (movieId && graphData) {
    drawFromMovieId(movieId);
  }

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
      .domain([d3.min(graph.nodes, d => d.averageRating), d3.max(graph.nodes, d => d.averageRating)])
      .range([5, 20]);

    const genres = Array.from(new Set(graph.nodes.map(d => (d.genres || '').split(',')[0])));
    const colorScale = d3.scaleOrdinal()
      .domain(genres)
      .range(d3.schemeCategory10);

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
      .attr('r', d => sizeScale(d.averageRating))
      .attr('fill', d => colorScale((d.genres || '').split(',')[0]))
      .call(drag(simulation));

    const tooltip = d3.select("#tooltip");

    node.on('mouseover', (event, d) => {
      tooltip
        .style("display", "block")
        .html(`<strong>${d.title}</strong><br/>
              Género: ${d.genres || 'N/A'}<br/>
              Rating: ${d.averageRating || 'N/A'}<br/>
              Director(es): ${d.directors || 'N/A'}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on('mouseout', () => {
      tooltip.style("display", "none");
    });

    simulation.on('tick', () => {
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
style="margin: 1rem 0; 
background-color: #695a03; 
padding: 0.5rem 1rem; 
border: none; 
cursor: pointer; 
border-radius: 5px;">Volver</button>

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
