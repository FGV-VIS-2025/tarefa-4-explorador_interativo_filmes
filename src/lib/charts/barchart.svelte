<script>
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    import '$lib/styles/barchart.css';

  
    export let data = [];
    export let labels = [];
    
    let tooltip;
    let svgContainer;
  
    const chartConfig = {
        width: 550,
        height: 380,
        margin: { top: 25, right: 20, bottom: 80, left: 45 }
    };

    function drawChart() {
        // Limpa SVG anterior
        d3.select(svgContainer).selectAll('*').remove();

        const svg = d3.select(svgContainer)
            .attr('width', chartConfig.width)
            .attr('height', chartConfig.height);

        tooltip = d3.select('body')
            .select('.tooltip');

        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip');
        }
  
        const innerWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
        const innerHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
    
        const xScale = d3.scaleBand()
            .domain(labels)
            .range([0, innerWidth])
            .padding(0.1);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data)+20])
            .range([innerHeight, 0]);
    
        const chart = svg.append('g')
            .attr('transform', `translate(${chartConfig.margin.left},${chartConfig.margin.top})`);
    
        // Barras
        chart.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')  // Aplica a classe 'bar' definida no CSS
            .attr('x', (_, i) => xScale(labels[i]))
            .attr('y', d => yScale(d))
            .attr('width', xScale.bandwidth())
            .attr('height', d => innerHeight - yScale(d))
            .on('mouseover', function (event, d) {
                tooltip.style('display', 'block').text(d);
            })
            .on('mousemove', function (event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px');
            })
            .on('mouseout', function () {
                tooltip.style('display', 'none');
            });
    
        // Eixo X
        chart.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            // Rotaciona os rótulos do eixo X                   
            .attr('transform', 'rotate(-45)')    
            .style('text-anchor', 'end')         
            .attr('dx', '-0.5em')                
            .attr('dy', '0.25em');               

        // Eixo Y
        chart.append('g')
            .call(d3.axisLeft(yScale));

        // Título
        svg.append('text')
            .attr('class', 'chart-title')  // Aplica a classe de título
            .attr('text-anchor', 'middle')
            .attr('x', chartConfig.width / 2)
            .attr('y', chartConfig.margin.top / 2)
            .text('Título do Gráfico');

        // Legenda eixo X
        chart.append('text')
            .attr('class', 'axis-label axis-label-x')  // Aplica a classe de legenda eixo X
            .attr('text-anchor', 'middle')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 65)
            .text('Eixo X');

        // Legenda eixo Y
        chart.append('text')
            .attr('class', 'axis-label axis-label-y')  // Aplica a classe de legenda eixo Y
            .attr('text-anchor', 'middle')
            .attr('x', -innerHeight / 2)
            .attr('y', -35)
            .attr('transform', 'rotate(-90)')
            .text('Eixo Y');
    }

    onMount(() => {
        drawChart();
    });

    afterUpdate(() => {
        drawChart();
    });
</script>

<svg bind:this={svgContainer}></svg>
  