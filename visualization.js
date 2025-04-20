// Placeholder para visualização interativa IMDb
// Exemplo:
const width = 800;
const height = 500;

const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

svg.append("text")
  .attr("x", width / 2)
  .attr("y", height / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "20px")
  .text("Cole aqui sua visualização D3.js!");
