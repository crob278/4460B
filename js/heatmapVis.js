class HeatmapVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
    }

    initVis() {
        let vis = this;


        vis.margin = {top: 100, right: 50, bottom: 100, left: 200};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.svg.append('text')
            .attr("x", 0)
            .attr("y", -50)
            .text('Hashtags for Top Videos in a Range')
            .attr("font-size", 20)
            .attr('text-anchor', 'middle');

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;
        let mapped = vis.data.map((d) =>({
            title: d.title,
            views: +d.views,
            hashtags: d.hashtags || [],
        }))

        let ranges = [
            {label: "> 100,000,000", min: 100000000, max: Infinity},
            {label: "50,000,000", min: 50000000, max: 99999999},
            {label: "1,000,000", min: 1000000, max: 49999999},
            {label: "500,000", min: 500000, max: 999999},
            {label: "10,000", min: 10000, max: 499999},
            {label: "10,000", min: 1000, max: 9999},
        ];

        let filteredVideos = [];

        ranges.forEach((r) => {
            let subset = mapped
                .filter(d => d.views >= r.min && d.views <= r.max)
                .sort((a, b) => b.views - a.views)
                .slice(0,10)
                .map((d, i) => ({
                    id: `${r.label}-${i}`,
                    viewRange: r.label,
                    title: d.title,
                    views: d.views,
                    hashtags: d.hashtags,
                }));
            filteredVideos = filteredVideos.concat(subset);
        })

        vis.displayData = filteredVideos;
        vis.viewRanges = ranges.map((r) => r.label);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let rowmax = 10;
        let cellsize = Math.min(vis.width / (rowmax + 2), vis.height / (vis.viewRanges.length + 2));

        let x = d3.scaleBand()
            .domain(d3.range(rowmax))
            .range([0, cellsize * rowmax])
            .padding(0.05)

        let y = d3.scaleBand()
            .domain(vis.viewRanges)
            .range([vis.height - cellsize, 0])
            .padding(0.3)

        let gridWidth = cellsize * rowmax;
        let xOffset = (vis.width - gridWidth) / 2;

        vis.svg.selectAll(".y-axis").remove();
        vis.svg.append("g")
            .attr("class", "y-axis")
            .style("font-size", 14)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain")
            .remove();

        let color = d3.scaleSequential().interpolator(d3.interpolateInferno)
            .domain([0, d3.max(vis.displayData, d => d.views)]);

        let tooltip = d3.select("#" + vis.parentElement).append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("font-size", 14)
            .style("position", "absolute")
            .style("max-width", "300px")
            .style("padding", "10px");

        let mouseover = function(event, d) {
            tooltip.style("opacity", 1);
            d3.select(this).style("opacity", 1)
                .style("stroke", "black")
        };
        let mousemove = function(event, d) {
            tooltip
                .html(
                    `<b>${d.title}</b><br>` +
                    `${d.views.toLocaleString()} views<br>` +
                    `<i>${d.hashtags.join(",")}</i>`
                )
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY - 30 + "px");
        };
        let mouseleave = function(event, d) {
            tooltip.style("opacity", 0);
            d3.select(this).style("opacity", 0.75)
                .style("stroke", "none")
        };
        vis.svg.selectAll(".cell")
            .data(vis.displayData)
            .enter()
            .append("rect")
            .attr("x", (d,i) => {
                let index = i % rowmax;
                return xOffset + x(index);
            })
            .attr("y", d => y(d.viewRange))
            .attr("width", cellsize)
            .attr("height", cellsize)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", d => color(d.views))
            .style("opacity", 0.75)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);



    }
}