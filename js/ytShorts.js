/*
* ShortsVis
* @param parentElement - Parent HTML element where the vis gets drawn
* @param data          - Data to be visualized (Shorts rate & normal video rate)
*
*/

class ShortsVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data | null;
        this.t = 0.0;
        this.active = false;

        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.t = 0.0;
        
        // Margin Convention
        vis.margin = {top: 10, right: 60, bottom: 10, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing Area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Titles
        
        // Seconds Elapsed Box

        // Seconds of Youtube Shorts Watched Box



    }

    renderVis() {
        let vis = this;
        vis.active = true;

    }

    resetVis() {
        let vis = this;
        vis.t = 0.0;
        vis.active = false;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        
    }



}

