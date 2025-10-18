class ChannelRank {

    constructor(parentElement,data) {

        this._parentElement = parentElement;
        this._data = data;

        this._displayData = data;
    }

    initVis() {

        let vis = this;

        vis.container = d3.select(`#${vis._parentElement}`);

        vis.rankBox = vis.container.append("div")
            .attr("id", "podium-frame")

        vis.updateVis(vis._data.countries[0])

    }

    updateVis(d) {
        let vis = this;

        vis.rankBox.selectAll("*").remove();

        const podium = vis.rankBox.append("div")
            .attr("id", "podium-ranks");

        const podiumHeader = podium.append("div")
            .attr("id", "podium-header")
            .text(d);

        const podiumMenu = podium.append("div")
            .attr("id", "podium-menu")
            .style("display", "none");

        podiumMenu.selectAll("div")
            .data(vis._data.countries)
            .enter()
            .append("div")
            .text(d => d)
            .on("click", function(event, d) {
                vis.updateVis(d);
            })


        podiumHeader.on("click", function() {
            const isVisible = podiumMenu.style("display") === "block";
            podiumMenu.style("display", isVisible ? "none" : "block");
        });

        const list = podium.append("ul");

        const ranks = vis._data.rankings[d] || [];

        list.selectAll("li")
            .data(ranks)
            .enter()
            .append("li")
            .text(d => d)
            .style("text-align", "center");

    }

}