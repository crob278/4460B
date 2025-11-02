
class EngagementVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        
        this.initVis();
    }
    initVis() {
        let vis = this;
        
        // Margin Convention
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing Area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales 
        
        // Main Chart

        // Axes

        // Titles and Labels


        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        /* 
        Incoming Data:
            video_id: string,
            duration: number,
            bitrate: number,
            bitrate(video): number,
            height: number,
            width: number,
            frame rate: number,
            frame rate(est.): number,
            codec: string,
            category: string,
            url: string,
            title: string,
            description: string,
            hashtags: string[],
            views: number,
            likes: number,
            comments: number
        */
       console.log(vis.data);
        

        vis.updateVis();
    }
    
    updateVis() {
        let vis = this;
        
        // Update and draw chart elements 

    }
}