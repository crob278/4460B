class PieChart{

    constructor(parentElement) {
        this.parentElement = parentElement;

        this.initVis()
    }

    initVis() {
        let vis = this;

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

        // Temporary dummy data
        vis.data = [
            { category: "A", value: 10 },
            { category: "B", value: 20 },
            { category: "C", value: 30 },
            { category: "D", value: 40 },
        ];

        vis.pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        vis.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(vis.width, vis.height) / 3);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        vis.arcs = vis.svg.selectAll("path")
            .data(vis.pie(vis.data))
            .enter()
            .append("path")
            .attr("d", vis.arc)
            .attr("fill", (d, i) => vis.color(i))
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        vis.svg.selectAll("text.label")
            .data(vis.pie(vis.data))
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("transform", d => `translate(${vis.arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(d => d.data.category);
    }
}