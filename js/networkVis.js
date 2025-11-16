class NetworkVis {
    constructor(parentElement, graphData ) {
        this.parentElement = parentElement;
        this.graphData = graphData;
        this.colors = ['#770303', '#8a8d9d', '#000000']; //color for hashtag nodes, color for video nodes, color for links
        this.currentFilter = "frequency";
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)

        vis.zoom = d3.zoom()
            .scaleExtent([0.3, 5])
            .on("zoom", (event) => {
                vis.chartGroup.attr("transform", event.transform);
        });

        vis.svg.call(vis.zoom);

        vis.chartGroup = vis.svg.append("g");

        vis.tooltip = d3.select("#hashtagTooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let nodes = vis.graphData.nodes.map(d => ({...d}));
        let links = vis.graphData.links.map(d => ({...d}));

        // console.log("Nodes : " + nodes);
        // console.log("Links : " + links);
        links.forEach(link => {
            if (typeof(link.source) === "object" && link.source.id) {
                link.source = link.source.id;
            }
            if (typeof(link.target) === "object" && link.source.id) {
                link.target = link.target.id;
            }
        })

        //Scale based off usage_count/view_count
        if (vis.currentFilter === "frequency") {
            nodes.forEach(d => {
                if (d.group === "hashtag") {
                    d.radius = Math.sqrt(d.usage_count || 1) * 2;
                }
                if (d.group.includes("video")) {
                    d.radius = Math.sqrt(d.views || 1) / 300;
                }
            });
        } else if (vis.currentFilter === "views") {
            nodes.forEach(d => {
                if (d.group === "hashtag") {
                    d.radius = Math.sqrt(d.view_count || 1) / 300;
                }
                if (d.group.includes("video")) {
                    d.radius = Math.sqrt(d.views || 1) / 300;
                }
            });
        } else if (vis.currentFilter === "top10_usage") {
            let topVideos = nodes.filter(d => d.group === "video_top");
            let relevantHashtags = new Set();

            topVideos.forEach(d => {
                (d.top_used_hashtags || []).forEach(tag => {
                    relevantHashtags.add(`hashtag_${tag.id}`);
                })
            })

            nodes = nodes.filter(d => d.group === "video_top" || relevantHashtags.has(d.id));

            links = links.filter(l =>
                nodes.find(n => n.id === l.source) && nodes.find(n => n.id === l.target)
            );

            nodes.forEach(d => {
                if (d.group === "hashtag") {
                    d.radius = Math.sqrt(d.usage_count || 1) * 2;
                }
                if (d.group.includes("video")) {
                    d.radius = Math.sqrt(d.views || 1) / 300;
                }
            })

        } else if (vis.currentFilter === "top10_views") {
            let topVideos = nodes.filter(d => d.group === "video_top");
            let relevantHashtags = new Set();

            topVideos.forEach(d => {
                (d.top_viewed_hashtags || []).forEach(tag => {
                    relevantHashtags.add(`hashtag_${tag.id}`);
                })
            })

            nodes = nodes.filter(d => d.group === "video_top" || relevantHashtags.has(d.id));

            links = links.filter(l =>
                nodes.find(n => n.id === l.source) && nodes.find(n => n.id === l.target)
            );

            nodes.forEach(d => {
                if (d.group === "hashtag") {
                    d.radius = Math.sqrt(d.view_count || 1) / 300;
                }
                if (d.group.includes("video")) {
                    d.radius = Math.sqrt(d.views || 1) / 300;
                }
            })
        }

        vis.filteredData = {nodes, links};
        console.log(vis.filteredData);

        vis.updateData();
    }

    updateData() {
        let vis = this;

        vis.chartGroup.selectAll("*").remove();

        let {nodes, links} = vis.filteredData;

        links.forEach(l => {
            if (typeof l.source === "string") {
                l.source = nodes.find(n => n.id === l.source);
            }
            if (typeof l.target === "string") {
                l.target = nodes.find(n => n.id === l.target);
            }
        })

        console.log(nodes);
        console.log(links);
        let simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(80))
            .force("charge", d3.forceManyBody().strength(-80))
            .force("center", d3.forceCenter(vis.width / 2 , vis.height / 2 ));

        let link = vis.chartGroup.append("g")
            .attr("stroke", vis.colors[2])
            .attr("stroke-opacity", 0.5)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1)


        let nodeGroup = vis.chartGroup.selectAll(".node-group")
            .data(nodes)
            .join("g")
            .attr("class", "node-group")
            .call(
                d3.drag()
                    .on("start", (event, d) => {
                        if (!event.active) {
                            simulation.alphaTarget(0.3).restart();
                        }
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) {
                            simulation.alphaTarget(0).restart();
                        }
                        d.fx = null;
                        d.fy = null;
                    }) );

        let node = nodeGroup.append("circle")
            .attr("r", d => d.radius || 4)
            .attr("fill", d => (d.group.includes("video") ? vis.colors[1] : vis.colors[0]))
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
                vis.tooltip
                    .style("opacity", 1)
                    .html(
                        `
                        <strong>${d.label}</strong>
                        <br>
                        ${d.group === "hashtag" 
                            ? `Usage Count: ${d.usage_count?.toLocaleString() || 0}
                            <br>
                            Views: ${d.view_count?.toLocaleString() || 0}` : 
                            `Views: ${d.views?.toLocaleString() || 0}`}
                        `
                    )
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
            })

            .on("mousemove", function () {
                vis.tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
            })

            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke", "none")
                vis.tooltip
                    .style("opacity", 0)
            })

            .on("click", function (event, d) {
                if (d.url) window.open(d.url, "_blank");
            });

        let labels = nodeGroup
            .filter(d => d.group === "hashtag")
            .append("text")
            .text(d => `#${d.label}`)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "8px")
            .attr("fill", "black")

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
        });

        function dragStarted(event) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragended(event) {
            if (!event.active) {
                simulation.alphaTarget(0);
            }
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }

    changeFilter(newFilter) {
        let vis = this;
        vis.currentFilter = newFilter;
        vis.wrangleData();
    }
}