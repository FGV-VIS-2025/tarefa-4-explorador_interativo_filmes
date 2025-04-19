// Configurações iniciais
const margin = { top: 40, right: 30, bottom: 60, left: 60 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Carregar dados
d3.json("data/imdb.json").then(data => {
  data = data.filter(d => d.startYear && d.averageRating && d.primaryTitle);
  data.forEach(d => {
    d.startYear = +d.startYear;
    d.averageRating = +d.averageRating;
  });

  // Escalas
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.startYear)).nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 10])
    .range([height, 0]);

  // Eixos
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Pontos
  svg.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.startYear))
    .attr("cy", d => y(d.averageRating))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .attr("opacity", 0.6)
    .append("title")
    .text(d => `${d.primaryTitle} (${d.startYear})\nNota: ${d.averageRating}`);

  // Dropdown de gêneros
  const genres = [...new Set(data.flatMap(d => d.genres ? d.genres.split(",") : []))].sort();
  const genreSelect = d3.select("#genre-select");
  genreSelect.append("option").text("Todos");
  genres.forEach(g => genreSelect.append("option").text(g));

  // Filtro por gênero
  genreSelect.on("change", () => {
    const selected = genreSelect.property("value");
    svg.selectAll("circle")
      .style("display", d => (selected === "Todos" || d.genres?.includes(selected)) ? null : "none");
  });

  // Filtro por ator
  d3.select("#actor-input").on("input", function() {
    const input = this.value.toLowerCase();
    svg.selectAll("circle")
      .style("display", d => (input === "" || (d.actors && d.actors.toLowerCase().includes(input))) ? null : "none");
  });
});
