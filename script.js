const margin = { top: 40, right: 30, bottom: 60, left: 60 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("data/imdb.json").then(data => {
  data = data.filter(d => d.startYear && d.averageRating && d.primaryTitle);
  data.forEach(d => {
    d.startYear = +d.startYear;
    d.averageRating = +d.averageRating;
    d.numVotes = +d.numVotes || 0;
  });

  // Limitar a renderização inicial aos 1000 filmes mais votados
  let renderData = data.sort((a, b) => b.numVotes - a.numVotes).slice(0, 1000);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.startYear)).nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 10])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .call(d3.axisLeft(y));

  const drawPoints = (subset) => {
    svg.selectAll("circle").remove();

    svg.append("g")
      .selectAll("circle")
      .data(subset)
      .join("circle")
      .attr("cx", d => x(d.startYear))
      .attr("cy", d => y(d.averageRating))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("opacity", 0.6)
      .append("title")
      .text(d => `${d.primaryTitle} (${d.startYear})\nNota: ${d.averageRating}`);
  };

  drawPoints(renderData);

  const genres = [...new Set(data.flatMap(d => d.genres ? d.genres.split(",") : []))].sort();
  const genreSelect = d3.select("#genre-select");
  genreSelect.append("option").text("Todos");
  genres.forEach(g => genreSelect.append("option").text(g));

  genreSelect.on("change", () => {
    const selected = genreSelect.property("value");
    const filtered = renderData.filter(d => selected === "Todos" || d.genres?.includes(selected));
    drawPoints(filtered);
  });

  d3.select("#actor-input").on("input", function() {
    const input = this.value.toLowerCase();
    const filtered = renderData.filter(d => input === "" || (d.actors && d.actors.toLowerCase().includes(input)));
    drawPoints(filtered);
  });
});
