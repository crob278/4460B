class PieChart{

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        console.log("loaded");

        vis.margin = {top: 10, right: 50, bottom: 10, left: 50};
        vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect().width -
            vis.margin.left -
            vis.margin.right;
        vis.height =
            document.getElementById(vis.parentElement).getBoundingClientRect().height -
            vis.margin.top -
            vis.margin.bottom;

        vis.svg = d3
            .select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.width / 2}, ${vis.height / 2})`);

        // data grouped by duration
        vis.aggregatedData = [
            { category: "0–1 min", value: d3.sum(vis.data.filter(v => v.duration < 60), d => d.views) },
            { category: "1–2 min", value: d3.sum(vis.data.filter(v => v.duration >= 60 && v.duration < 120), d => d.views) },
            { category: "2–3 min", value: d3.sum(vis.data.filter(v => v.duration >= 120 && v.duration < 180), d => d.views) },
            { category: "3–4 min", value: d3.sum(vis.data.filter(v => v.duration >= 180 && v.duration < 240), d => d.views) },
            { category: "4–5 min", value: d3.sum(vis.data.filter(v => v.duration >= 240 && v.duration < 300), d => d.views) },
            { category: "5–20 min", value: d3.sum(vis.data.filter(v => v.duration >= 300 && v.duration < 1200), d => d.views) },
            { category: "20+ min", value: d3.sum(vis.data.filter(v => v.duration >= 1200), d => d.views) }
        ];

        vis.pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        vis.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(vis.width, vis.height) / 3);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        // Store original outer radius
        const outerRadius = Math.min(vis.width, vis.height) / 3;

// Arc generator
        const tooltip = d3.select("#pieTooltip");

        vis.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(outerRadius);

        vis.arcs = vis.svg.selectAll("path")
            .data(vis.pie(vis.aggregatedData))
            .enter()
            .append("path")
            .attr("d", vis.arc)
            .attr("fill", (d, i) => vis.color(i))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", d3.arc()
                        .innerRadius(0)
                        .outerRadius(outerRadius * 1.1)
                    );

                tooltip.style("display", "block")
                    .html(`Total view count: ${d.data.value.toLocaleString()}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", vis.arc);

                tooltip.style("display", "none");
            });

        const totalViews = d3.sum(vis.aggregatedData, d => d.value);

        vis.labels = vis.svg.selectAll("text.label")
            .data(vis.pie(vis.aggregatedData))
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#000")
            .each(function(d) {
                const percent = ((d.data.value / totalViews) * 100).toFixed(1) + "%";
                const centroid = vis.arc.centroid(d);
                const angle = (d.startAngle + d.endAngle) / 2;
                const midRadius = (vis.arc.innerRadius()() + vis.arc.outerRadius()()) / 2;

                // Compute approximate arc length along outer radius
                const arcLength = (d.endAngle - d.startAngle) * vis.arc.outerRadius()();

                // Estimate width of the text in pixels
                const textWidth = percent.length * 7; // ~7px per char, adjust as needed

                if (textWidth < arcLength - 50) {
                    // Place inside
                    d3.select(this)
                        .attr("x", centroid[0])
                        .attr("y", centroid[1])
                        .text(percent);
                } else {
                    const r = vis.arc.outerRadius()() + 10; // offset outside
                    d3.select(this)
                        .attr("x", Math.cos(angle - Math.PI/2) * r)
                        .attr("y", Math.sin(angle - Math.PI/2) * r)
                        .text(percent);
                }
            });



        // Legend container
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${-(vis.width/2)}, ${-(vis.height/2)})`);

        legend.selectAll("rect")
            .data(vis.aggregatedData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d,i) => i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", (d,i) => vis.color(i));

        legend.selectAll("text")
            .data(vis.aggregatedData)
            .enter()
            .append("text")
            .attr("x", 18)
            .attr("y", (d,i) => i * 20 + 10)
            .text(d => d.category)
            .attr("font-size", "12px")
            .attr("fill", "#000");

    }
}