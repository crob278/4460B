const categoryMap = {
    0: "News & Politics",
    1: "Gaming",
    2: "Comedy",
    3: "People & Blogs",
    4: "Entertainment",
    5: "Music",
    6: "Education",
    7: "Nonprofits & Activis",
    8: "Sports",
    9: "Autos & Vehicles",
    10: "Howto & Style",
    11: "Travel & Events",
    12: "Film & Animation",
    13: "Science & Technology",
    14: "Pets & Animals",
    15: "Shows"
};




class EngagementVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = [];
        this.displayData = [];

        this.category = "News & Politics"; // Default Category
        this.viewThreshold = 1000; // Default View Threshold
        
        this.initVis();
    }
    initVis() {
        let vis = this;
        
        // Margin Convention
        vis.margin = {top: 20, right: 20, bottom: 100, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing Area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales 
        vis.x = d3.scalePow()
            .exponent(0.5)
            .range([0, vis.width]);

        vis.y = d3.scalePow()
            .exponent(0.5)
            .range([vis.height, 0]);

        vis.colorScale = d3.scaleSequentialLog(d3.interpolateMagma);

        vis.r = d3.scaleSqrt()
            .range([3, 50]);

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

        // Axis Labels
        vis.xAxisLabel = vis.svg.append("text")
            .attr("class", "x axis-label")
            .attr("x", vis.width - 200)
            .attr("y", vis.height - 10)
            .text("Like Percentage (Likes / Views)");

        vis.yAxisLabel = vis.svg.append("text")
            .attr("class", "y axis-label")
            .attr("x", 0)
            .attr("y", -10)
            .attr("text-anchor", "left")
            .attr("transform", "rotate(90)")
            .text("Comment Percentage (Comments / Views)");

        vis.xAxis = d3.axisBottom(vis.x)
            .tickFormat(d3.format(".1%"));

        vis.yAxis = d3.axisLeft(vis.y)
            .tickFormat(d3.format(".1%"));

        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // let categories = Array.from(new Set(vis.data.map(d => d.category)));
        // console.log(categories);

        
        // Filter data based on config
        vis.filteredData = d3.filter(vis.data, d => {
            if (!vis.category) {
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
        // console.log(vis.displayData.length); Cant display 17000 points

        vis.updateVis();
    }
    
    updateVis() {
        let vis = this;

        // Update scales
        vis.x.domain(d3.extent(vis.displayData, d => d.likePercent));
        vis.y.domain(d3.extent(vis.displayData, d => d.commentPercent));
        vis.r.domain(d3.extent(vis.displayData, d => d.views));

        vis.colorScale.domain(d3.extent(vis.displayData, d => d.views));

        vis.circles = vis.circlesGroup.selectAll("circle")
            .data(vis.displayData);

        vis.circles.enter()
            .append("circle")
            .merge(vis.circles)
            .attr("cx", d => { 
                let x = vis.x(d.likePercent);
                if(x - vis.r(d.views) < 0) {
                    x += vis.r(d.views);
                }
                return x;
            })
            .attr("cy", d => { 
                let y = vis.y(d.commentPercent);
                if(y + vis.r(d.views) > vis.height) {
                    y -= vis.r(d.views);
                }
                return y;
            })
            .attr("r", d => vis.r(d.views))
            .attr("fill", d => vis.colorScale(d.views))
            .attr("opacity", 0.8)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2);
                
                // Tooltip
                vis.tooltip.style("opacity", 0.9)
                    .style("position", "absolute")
                    .style("left", (event.pageX + 5) + "px") // TODO: Make sure it does not go off screen
                    .style("top", (event.pageY + 5) + "px")
                    .html(`<div id="tooltip-body">
                            <a href="${d.url}" target="_blank"><strong>${d.title}</strong></a><br>
                            <strong>Views:</strong> ${d.views}<br>
                            <strong>Like %:</strong> ${(d.likePercent * 100).toFixed(2)}%<br>
                            <strong>Comment %:</strong> ${(d.commentPercent * 100).toFixed(2)}%
                        </div>`);
            })
            .on("mousemove", function(event, d) {
                vis.tooltip
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY + 5) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke", "none");

                vis.tooltip.style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .on("click", function(event, d) { 
                window.open(d.url, '_blank');
            });

        vis.circles.exit().remove();

        vis.svg.select(".x-axis").transition().duration(1000).call(vis.xAxis);
        vis.svg.select(".y-axis").transition().duration(1000).call(vis.yAxis);

    }

    changeCategory(category) {
        let vis = this;
        vis.category = categoryMap[category] || null;

        vis.wrangleData();
    }

    changeViewThreshold(threshold) {
        let vis = this;
        vis.viewThreshold = threshold;

        vis.wrangleData();
    }
}