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
                .padding(2);

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
    }

    updateTreeMap(seconds) {
        let vis = this;
        const fraction = seconds / 600;

        // Scale data
        const scaledData = vis.displayData.map(d => ({
            name: d.category,
            value: Math.round(d.views * fraction)
        }));

        // Build hierarchy
        const root = d3.hierarchy({ children: scaledData })
            .sum(d => d.value);

        vis.treemap(root);

        const nodes = vis.treeSvg.selectAll("g.node")
            .data(root.leaves(), d => d.data.name);

        const nodeEnter = nodes.enter().append("g")
            .attr("class", "node");

        nodeEnter.append("rect")
            .attr("stroke", "#fff")
            .attr("fill", "#ff6666");

        nodeEnter.append("text")
            .attr("fill", "#000")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em");

        const allNodes = nodeEnter.merge(nodes);

        allNodes.transition().duration(200)
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        allNodes.select("rect")
            .transition().duration(200)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => d3.interpolateReds(d.value / d3.max(scaledData, d => d.value)));

        allNodes.select("text")
            .transition().duration(200)
            .attr("x", d => (d.x1 - d.x0) / 2)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .text(d => `${d.data.name}\n${d.data.value}`);

        nodes.exit().remove();
    }
}

