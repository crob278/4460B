class YtDashboard {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

        initVis() {
        let vis = this;
        console.log("YT Dashboard Loaded");

        vis.margin = { top: 20, right: 20, bottom: 30, left: 100 };
        // vis.width = 640 - vis.margin.left - vis.margin.right;
        // vis.height = 320 - vis.margin.top - vis.margin.bottom;
            vis.width = d3.select("#ytVideoArea").node().clientWidth - vis.margin.left - vis.margin.right;
            vis.height = d3.select("#ytVideoArea").node().clientHeight - vis.margin.top - vis.margin.bottom;


            // SVG inside the white video area
        vis.svg = d3.select("#ytVideoArea")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Aggregate data by category
        vis.aggregatedData = Array.from(
            d3.rollup(vis.data, v => d3.sum(v, d => d.views), d => d.category),
            ([category, views]) => ({ category, views })
        );

        // console.log("Category data:",vis.aggregatedData);


        vis.displayData = vis.aggregatedData.sort((a, b) => b.views - a.views).slice(0, 10);

        vis.x = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d.views)])
            .range([0, vis.width]);

        vis.y = d3.scaleBand()
            .domain(vis.displayData.map(d => d.category))
            .range([0, vis.height])
            .padding(0.2);

            vis.svg.selectAll(".bar")
                .data(vis.displayData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", d => vis.y(d.category))
                .attr("width", 0) // start at 0
                .attr("height", vis.y.bandwidth())
                .attr("fill", "#ff0000");

            vis.svg.selectAll(".bar-label")
                .data(vis.displayData)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", 5) // fixed left edge
                .attr("y", d => vis.y(d.category) + vis.y.bandwidth()/2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "start")
                .text(0) // start at 0
                .attr("fill", "#000")
                .attr("font-size", 12);


        vis.svg.append("g")
            .call(d3.axisLeft(vis.y).tickSize(0))
            .selectAll("text")
            .attr("fill", "#000");

            vis.treeWidth = d3.select("#ytTreeMapArea").node().clientWidth;
            vis.treeHeight = d3.select("#ytTreeMapArea").node().clientHeight;

            vis.treeSvg = d3.select("#ytTreeMapArea")
                .append("svg")
                .attr("width", vis.treeWidth)
                .attr("height", vis.treeHeight)
                .append("g");

            vis.treemap = d3.treemap()
                .size([vis.treeWidth, vis.treeHeight])
                .padding(2)
                .tile(d3.treemapResquarify);

            vis.svg.append("text")
                .attr("x", vis.width / 2 - 20)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("fill", "#000")
                .attr("font-size", 14)
                .text("Views");

            vis.svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -vis.height / 2 + 10)
                .attr("y", -vis.margin.left + 15) // in the left margin
                .attr("text-anchor", "middle")
                .attr("fill", "#000")
                .attr("font-size", 14)
                .text("Category");


            // Slider
        const slider = d3.select("#ytSlider");
        const tooltip = d3.select("#ytTooltip");

        slider.on("input", function() {
            const seconds = +this.value;
            const minutes = Math.floor(seconds / 60);
            const secs = String(seconds % 60).padStart(2, "0");
            const timeLabel = `${minutes}:${secs}`;

            const percent = seconds / 600;
            tooltip
                .style("left", `${percent * 600 + 20}px`)
                .text(`Length: ${timeLabel}`);

            vis.updateBars(seconds);
            vis.updateTreeMap(seconds);
        });
    }

    updateBars(seconds) {
        let vis = this;
        const fraction = seconds / 600;
        const formatComma = d3.format(",");

        // Compute scaled views for bars and labels
        const scaledData = vis.displayData.map(d => ({
            category: d.category,
            scaledViews: Math.round(d.views * fraction)
        }));

        // Update bars
        const bars = vis.svg.selectAll(".bar")
            .data(scaledData, d => d.category);

        bars.join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", d => vis.y(d.category))
                .attr("height", vis.y.bandwidth())
                .attr("fill", "#ff0000")
                .attr("width", d => vis.x(d.scaledViews)),
            update => update.transition().duration(100)
                .attr("width", d => vis.x(d.scaledViews))
                .attr("y", d => vis.y(d.category)),
            exit => exit.transition().duration(100).attr("width", 0).remove()
        );

        // Update labels
        const labels = vis.svg.selectAll(".bar-label")
            .data(scaledData, d => d.category);

        labels.join(
            enter => enter.append("text")
                .attr("class", "bar-label")
                .attr("fill", "#000")
                .attr("font-size", 12)
                .merge(labels)
                .transition().duration(100)
                .attr("x", d => {
                    const barWidth = vis.x(d.scaledViews);
                    const labelWidth = 30;
                    return barWidth + labelWidth > vis.width ? barWidth - 5 : barWidth + 5;
                })
                .attr("y", d => vis.y(d.category) + vis.y.bandwidth()/2)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => {
                    const barWidth = vis.x(d.scaledViews);
                    const labelWidth = 60;
                    return (barWidth + labelWidth > vis.width) ? "end" : "start";
                })
                .text(d => formatComma(d.scaledViews))
        );

        bars.on("mouseover", function(event, d) {
            // Select the corresponding rectangle in the tree map
            vis.treeSvg.selectAll(".tree-rect")
                .filter(r => r.data.name === d.category)
                .transition().duration(200)
                .attr("stroke-width", 2)
                .attr("stroke", "#000")
                .attr("fill", "#ff6666");
        })
            .on("mouseout", function(event, d) {
                vis.treeSvg.selectAll(".tree-rect")
                    .filter(r => r.data.name === d.category)
                    .transition().duration(200)
                    .attr("stroke-width", 1)
                    .attr("stroke", "#fff")
                    .attr("fill", r => d3.interpolateReds(r.value / d3.max(vis.displayData, x => x.views)))
                    .attr("width", r => r.x1 - r.x0)
                    .attr("height", r => r.y1 - r.y0);
            });

    }

    updateTreeMap(seconds) {
        let vis = this;
        const fraction = seconds / 600; // progress from 0 to 1
        const formatComma = d3.format(",");

        // Scale data for this second
        const scaledData = vis.displayData.map(d => ({
            name: d.category,
            value: d.views * fraction
        }));

        const totalMax = d3.sum(vis.displayData, d => d.views); // total full value
        const currentTotal = d3.sum(scaledData, d => d.value);  // current scaled value

        const maxVal = d3.max(vis.displayData, d => d.views);

        // Build hierarchy and compute treemap layout
        const root = d3.hierarchy({ children: scaledData }).sum(d => d.value);
        vis.treemap(root);

        // Compute scaling factor to center the rectangles and grow proportionally
        const k = Math.sqrt(currentTotal / totalMax); // scale factor based on fraction
        const tx = (1 - k) / 2 * vis.treeWidth;
        const ty = (1 - k) / 2 * vis.treeHeight;

        const leaves = root.leaves().map(d => ({
            ...d,
            x0: tx + (d.x0) * k,
            x1: tx + (d.x1) * k,
            y0: ty + (d.y0) * k,
            y1: ty + (d.y1) * k
        }));

        const nodes = vis.treeSvg.selectAll("g.node")
            .data(leaves, d => d.data.name);

        // Enter
        const nodeEnter = nodes.enter().append("g")
            .attr("class", "node");

        nodeEnter.append("rect")
            .attr("class", "tree-rect")
            .attr("data-name", d => d.data.name)
            .attr("x", vis.treeWidth / 2)
            .attr("y", vis.treeHeight / 2)
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", "#ff9999")
            .attr("stroke", "#fff");

        nodeEnter.append("text")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .text("");

        const allNodes = nodeEnter.merge(nodes);

        // Animate rectangles
        allNodes.select("rect")
            .transition().duration(500).ease(d3.easeCubicOut)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => d3.interpolateReds(d.value / maxVal));

        // Animate text
        allNodes.select("text")
            .transition().duration(500).ease(d3.easeCubicOut)
            .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
            .attr("y", d => d.y0 + (d.y1 - d.y0) / 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", d => Math.min((d.x1 - d.x0) / d.data.name.length, 16)) // max 16px
            .text(d => (d.x1 - d.x0 > 40 ? d.data.name : ""));

        const tooltip = d3.select("#treeTooltip");

        allNodes.select("rect")
            .on("mouseover", function(event, d) {
                const percent = ((d.value / currentTotal) * 100).toFixed(1);
                tooltip.style("opacity", 1)
                    .html(`
                    <strong>${d.data.name}</strong><br>
                    Views: ${formatComma(Math.round(d.value))}<br>
                    ${percent}% of total views
                `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });


        nodes.exit().remove();
    }
}

