class ChannelRank {

    constructor(parentElement, rankData, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.rankData = rankData;

        // define colors
        this.colors = ['#ffd3c1ff', '#ffafa6ff', '#ff908dff', '#f76363ff']
        this.initVis()
    }

    initVis() {
        let vis = this;


        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .text('Popular Channels Globaly')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.legendGroup = vis.svg.append('g')
            .attr('class', 'legend-group')
            .attr("transform", `translate(30, ${vis.height - 80})`);


        vis.projection = d3.geoOrthographic()
            .translate([vis.width / 2, vis.height / 2]);

        vis.projection
            .scale(230);

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr("class", "country")
            .attr("stroke-width", 2 )
            .attr("stroke", 'black')
            .attr("d", vis.path);

        vis.tooltip = d3.select("#rankTooltip");


        let m0,o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        )

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // create random data structure with information for each land
        vis.countryInfo = {};

        Object.keys(vis.rankData.rankings).forEach(country => {
            let info = vis.rankData.rankings[country];

            let scale = d3.scaleLinear()
                .domain([0, d3.max(Object.values(vis.rankData.rankings), d => d.totalSubs)])
                .range([0, vis.colors.length - 1]);

            let colorIndex = Math.floor(scale(info.totalSubs));

            vis.countryInfo[country] = {
                name: country,
                color: vis.colors[colorIndex],
                totalSubs: info.totalSubs,
                topChannels: info.topChannels,
            };
            //console.log(vis.countryInfo[country]);
        });

        vis.updateVis()
    }


    updateVis() {
        let vis = this;


        vis.svg.selectAll(".country")
            .style("fill", d => {
                // console.log(d);
                let country = vis.countryInfo[d.properties.name];
                // console.log(d.properties.name)
                // console.log(country);
                if (country) {
                    // console.log("Country: " + country);
                    return country.color
                } else {
                    // console.log("Country rejected: " + country);
                    return '#ecececff';
                }
            })
            .style("stroke-width", "0.5px")
            .on("mouseover", function(event, d) {
                let info = vis.countryInfo[d.properties.name];

                if (info) {
                    d3.select(this)
                        .style("stroke-width", "1px")
                        .style("stroke", "black");
                    vis.tooltip
                        .style("display", "block")
                        .style("opacity", 1)
                        .html(`
                            <strong style="text-align:center; display:block; margin-bottom: 6px;">
                                Channel Popularity for ${d.properties.name} (Descending)
                            </strong>
                            ${info.topChannels.map((c,i) => 
                            `<div>${i + 1}) ${c.name} - ${vis.formatSubs(c.subs)}</div>`).join("")}
                             <br>
                             <div>Total Subscribers: ${info.totalSubs.toLocaleString()}</div>
                            `);
                }
            })
            .on("mousemove", function(event) {
                vis.tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function(event, d) {
                let info = vis.countryInfo[d.properties.name];
                d3.select(this)
                    // console.log(info)
                    .style("stroke-width", "0.5px")
                    .attr("fill", info ? info.color : '#ecececff')
                    // console.log("name, info, info.color: " + d.properties.name + ", " + info + ", " + info.color );

                vis.tooltip
                    .style("opacity", 0)
                    .style("display", "none");

            });
        vis.updateLegend();
    }

    formatSubs(subs) {
        if (subs >= 1e6) return (subs / 1e6).toFixed(2) + "M";
        if (subs >= 1e3) return (subs / 1e3).toFixed(2) + "K";
        return subs;
    }

    updateLegend() {
        let vis = this;

        vis.legendGroup.selectAll("*").remove();

        let legend_width = 160;
        let legend_height = 10;

        let definition = vis.svg.append("defs");

        let gradient = definition.append("linearGradient")
            .attr("id", "subGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        vis.colors.forEach((color, i) => {
            gradient.append("stop")
                .attr("offset", `${(i / (vis.colors.length - 1)) * 100}%`)
                .attr("stop-color", color);
        });

        vis.legendGroup.append("rect")
            .attr("width", legend_width)
            .attr("height", legend_height)
            .style("fill", "url(#subGradient)")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .attr("rx", 3)
            .attr("ry", 3);

        vis.legendGroup.append("text")
            .attr("x", -30)
            .attr("y", legend_height + 15)
            .attr("font-size", "10px")
            .attr("fill", "black")
            .text("Least total subscribers")

        vis.legendGroup.append("text")
            .attr("x", legend_width + 100)
            .attr("y", legend_height + 15)
            .attr("font-size", "10px")
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("Most total Subscribers")

        vis.legendGroup.append("text")
            .attr("x", 30)
            .attr("y", -5)
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text("Total Subscribers")
    }

}