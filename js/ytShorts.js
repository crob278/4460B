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
        this.active = false;
        this.timer = null;
        this.t = 0;

        this.initVis();
    }
    initVis() {
        let vis = this;
        
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

        vis.timer = d3.timer(() => {});
        
        vis.timerGroup = vis.svg.append('g')
            .attr('class', 'timerGroup');

        vis.timerText = vis.timerGroup.append('text')
            .attr('class', 'timerText')
            .attr('x', 0)
            .attr('y', 0)
            .text('Time Elapsed: 0.0 s');

    


    }

    renderVis() {
        let vis = this;
        vis.active = true;
        vis.timer.restart((elapsed) => {
            vis.t = (elapsed / 1000).toFixed(2); // Ms to S
            vis.updateVis(); // Updates on every frame (60fps)
        }); 
    }

    resetVis() {
        let vis = this;
        vis.active = false;
        vis.timer.stop();
        vis.t = 0.0;

        vis.updateVis();
    }

    changeView() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.timerText.text(`Time Elapsed: ${vis.t} s`);
    }



}


