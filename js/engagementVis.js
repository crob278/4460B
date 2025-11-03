
class EngagementVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = [];
        this.displayData = [];

        this.category = "all"; 
        this.viewThreshold = 100000;
        
        this.initVis();
    }
    initVis() {
        let vis = this;
        
        // Margin Convention
        vis.margin = {top: 20, right: 20, bottom: 50, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing Area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales 
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);
            
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateReds);

        // Main Chart
        vis.chart = vis.svg.append("g")
            .attr("class", "scatter-plot");

        vis.circlesGroup = vis.chart.append("g")
            .attr("class", "circles-group");

        vis.circles = vis.circlesGroup.selectAll("circle");

        // Axes
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", "translate(0,0)")

        vis.xAxis = d3.axisBottom(vis.x)
            .ticks(5)
            .tickFormat(d3.format(".0%"));

        vis.yAxis = d3.axisLeft(vis.y)
            .ticks(5)
            .tickFormat(d3.format(".0%"));

        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Filter data based on config
        console.log(vis.category);
        vis.filteredData = d3.filter(vis.data, d => {
            if (vis.category === "all") {
                return true;
            } else {
                return d.category === vis.category;
            }
        });
        vis.displayData = [];
        vis.filteredData.forEach(d => {
            if (d.views > vis.viewThreshold && d.likes > 0 && d.comments > 0) {
                vis.displayData.push({
                    views: d.views,
                    likePercent: (d.likes / d.views),
                    commentPercent: (d.comments / d.views),
                    title: d.title,
                    url: d.url // I have an idea 
                });
            }
        });
        console.log(vis.displayData.length);
        //vis.displayData.sort(d3.descending((a, b) => a.views - b.views));

        vis.updateVis();
    }
    
    updateVis() {
        let vis = this;

        // Update scales
        vis.x.domain(d3.extent(vis.displayData, d => d.likePercent));
        vis.y.domain(d3.extent(vis.displayData, d => d.commentPercent));
        vis.colorScale.domain(d3.extent(vis.displayData, d => d.views));

        vis.circles = vis.circlesGroup.selectAll("circle")
            .data(vis.displayData);

        vis.circles.enter()
            .append("circle")
            .merge(vis.circles)
            .attr("cx", d => vis.x(d.likePercent))
            .attr("cy", d => vis.y(d.commentPercent))
            .attr("r", 5)
            .attr("fill", d => vis.colorScale(d.views))
            .attr("opacity", 1)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
                
                // Tooltip
                vis.tooltip.style("opacity", 0.9)
                    .style("position", "absolute")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY + 5) + "px")
                    .html(`<div id="tooltip-body">
                            <a href="${d.url}" target="_blank"><strong>${d.title}</strong></a><br>
                            <strong>Views:</strong> ${d.views}<br>
                            <strong>Like %:</strong> ${(d.likePercent * 100).toFixed(2)}%<br>
                            <strong>Comment %:</strong> ${(d.commentPercent * 100).toFixed(2)}%
                        </div>`);
            })
            // WE CAN GO TO THE VIDEO 
            .on("click", function(event, d) { 
                window.open(d.url, '_blank');
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke", "none");

                vis.tooltip.attr("opacity", 0)
                    .attr("left", 0)
                    .attr("top", 0)
                    .html(``);
            });

        vis.circles.exit().remove();

        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis); 

    }

    changeCategory(category) {
        let vis = this;
        vis.category = category;

        vis.wrangleData();
    }

    changeViewThreshold(threshold) {
        let vis = this;
        vis.viewThreshold = threshold;

        vis.wrangleData();
    }
}