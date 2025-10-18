class ChannelRank {

    constructor(parentElement,data) {

        this._parentElement = parentElement;
        this._data = data;

        this._displayData = data;
    }

    initVis() {

        let vis = this;

        vis.container = d3.select(`#${vis._parentElement}`);

        vis.dropDownSelect = vis.container.append("select")
            .attr("id", "CountryList")
            .style("font-size", "12px")
            .style("padding", "5px")
            .on("change", d => {
                vis.updateVis(d);
            })

        vis.dropDownSelect.selectAll("option")
            .data(vis.data.countries)
            .enter()
            .append("option")
            .attr("value", d=> d)
            .text(d => d)

        vis.rankBox = vis.container.append("div")
            .attr("id", "podium")
            .style("font-size", "12px")
            .style("margin-top", "10px")

        vis.updateVis(vis.data.countries[0])

    }

    updateVis(d) {
        let vis = this;

        vis.rankBox.selectAll("*").remove();

        const podium = vis.rankBox.append("div")
            .style("font-size", "12px")
            .style("width", "100px")

        podium.append("div")
            .style("background-color", "white")
            .text(d)

        const list = podium.append("ul")
            .style("list-style-type", "none")

        list.selectAll("li")
            .data(vis._data.rankings[d])
            .enter()
            .append("li")
            .text(d => d)
    }

}