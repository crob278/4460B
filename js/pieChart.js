class PieChart{

    constructor(parentElement) {
        this.parentElement = parentElement;

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 50, bottom: 10, left: 50 };
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
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.svg
            .append("text")
            .text("Title for Map")
            .attr("x", vis.width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "20px")
            .attr("font-weight", "bold");
    }
}