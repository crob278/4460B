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
        this.view = false; // false = shorts, true = regular videos
        this.timer = null;
        this.shortsFactor;
        this.videoFactor;
        this.t = 0;

        this.initVis();
    }
    initVis() {
        let vis = this;
        
        // Margin Convention
        vis.margin = {top: 10, right: 20, bottom: 10, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing Area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.timer = d3.timer(() => {});

        // Hardcoding values for how fast shorts vs regular videos are watched
        vis.shortsScale = 2e11 * 15; // Seconds on shorts per day
        vis.videoScale = 1e9 * 60 * 60; // Seconds on regular videos per day

        vis.shortsScale /= (24 * 60 * 60); // per second
        vis.videoScale /= (24 * 60 * 60);

        vis.shortsScale /= (60 * 60); // convert to hours
        vis.videoScale /= (60 * 60); 


        vis.scaleFactor = vis.height / 60;
        
        vis.timerGroup = vis.svg.append('g')
            .attr('class', 'timerGroup')
            .attr('transform', `translate(0, 20)`);

        vis.timerText = vis.timerGroup.append('text')
            .attr('class', 'timerText')
            .text('Time Elapsed: 0.0 s');

        vis.timerBar = vis.timerGroup.append('rect')
            .attr('class', 'timerRect')
            .attr('y', 5) 
            .attr('width', 10)
            .attr('height', 1)
            .attr('fill', 'red');


        vis.shortsTimerGroup = vis.svg.append('g')
            .attr('class', 'shortsTimerGroup')
            .attr('visible', 'true')
            .attr('transform', `translate(170, 20)`);
            
        vis.shortsTimerText = vis.shortsTimerGroup.append('text')
            .attr('class', 'timerText shortsTimerText')
            .text('Collective hours spent watching youtube shorts: 0.0 hrs');

        vis.shortsTimerBar = vis.shortsTimerGroup.append('rect')
            .attr('class', 'timerRect shortsTimerRect')
            .attr('y', 10)
            .attr('width', 0)
            .attr('height', 0)
            .attr('fill', 'red'); // overriden in css

        vis.videoTimerGroup = vis.svg.append('g')
            .attr('class', 'videoTimerGroup')
            .attr('transform', `translate(170, 20)`)
            .attr('visibility', 'hidden');
            
        vis.videoTimerText = vis.videoTimerGroup.append('text')
            .attr('class', 'timerText videoTimerText')
            .text('Collective hours spent watching youtube videos: 0.0 hrs');

        vis.videoTimerBar = vis.videoTimerGroup.append('rect')
            .attr('class', 'timerRect videoTimerRect')
            .attr('y', 10)
            .attr('width', 0)
            .attr('height', 0)
            .attr('fill', 'red');

    }

    start() {
        let vis = this;
        vis.timer.restart((elapsed) => {
            vis.t = (elapsed / 1000).toFixed(2); // Ms to S
            vis.updateVis(); // Updates on every frame
        }); 
    }

    pause() {
        let vis = this;
        vis.timer.stop();

        vis.updateVis();
    }

    reset() {
        let vis = this;
        vis.timer.stop();
        vis.t = 0.0;
        vis.start();
    }

    changeView() {
        let vis = this;
        vis.view = !vis.view;

        vis.shortsTimerGroup.attr('visibility', `${!vis.view ? 'visible' : 'hidden'}`);
        vis.videoTimerGroup.attr('visibility', `${vis.view ? 'visible' : 'hidden'}`);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.timerText.text(`Time Elapsed: ${vis.t} s`);
        vis.timerBar.attr('height', vis.t * vis.scaleFactor);

        let shortsTime = Math.sqrt(vis.t * vis.shortsScale).toFixed(2); 
        vis.shortsTimerText.text(`Collective hours spent watching youtube shorts: ${(vis.t * vis.shortsScale).toFixed(2)} hrs`);
        vis.shortsTimerBar.attr('height', (shortsTime))
            .attr('width', shortsTime);

        let videoTime = Math.sqrt(vis.t * vis.videoScale).toFixed(2);
        vis.videoTimerText.text(`Collective hours spent watching youtube videos: ${(vis.t * vis.videoScale).toFixed(2)} hrs`);
        vis.videoTimerBar.attr('height', (videoTime))
            .attr('width', videoTime);

    }

}


