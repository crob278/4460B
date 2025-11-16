class ChannelRank {

    constructor(parentElement, rankData, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.rankData = rankData;

        // define colors
        this.colors = ['#e07c53', '#cb7c7c', '#d25f5f', '#d23d3d', '#db1818', '#770303']
        this.initVis()
    }

    initVis() {
        let vis = this;


        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .text('Popular Channels Globaly')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


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
            console.log(vis.countryInfo[country]);
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
                    return '#c1b3b3';
                }
            })
            .on("mouseover", function(event, d) {
                let info = vis.countryInfo[d.properties.name];

                if (info) {
                    d3.select(this)
                        .attr("stroke-width", "2px")
                        .attr("stroke", "black");
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
                    .attr("fill", info ? info.color : '#c1b3b3')
                    // console.log("name, info, info.color: " + d.properties.name + ", " + info + ", " + info.color );

                vis.tooltip
                    .style("opacity", 0)
                    .style("display", "none");

            });
    }

    formatSubs(subs) {
        if (subs >= 1e6) return (subs / 1e6).toFixed(2) + "M";
        if (subs >= 1e3) return (subs / 1e3).toFixed(2) + "K";
        return subs;
    }

}