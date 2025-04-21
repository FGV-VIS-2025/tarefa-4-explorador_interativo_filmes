import * as d3 from 'd3';

export function renderBarChart(containerSelector) {
  const data = [25, 40, 15, 60, 20];

  const width = 300;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const svg = d3
    .select(containerSelector)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3
    .scaleBand()
    .domain(data.map((d, i) => i))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (_, i) => x(i))
    .attr('y', d => y(d))
    .attr('height', d => y(0) - y(d))
    .attr('width', x.bandwidth())
    .attr('class', 'bar');

  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => `Item ${i + 1}`));

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}
