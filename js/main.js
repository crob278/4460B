let ytDashVis,
    viewsVis,
    rankVis,
    shortsVis,
    engagementVis,
    diceVis;

// Load Data with Promises
let promises = [
    d3.csv("data/youtube_data.csv").then(csvData => {
        csvData.forEach(d => {
            // video_id: string
            d.duration = +d.duration;
            d.bitrate = +d.bitrate;
            d["bitrate(video)"] = +d["bitrate(video)"];
            d.height = +d.height;
            d.width = +d.width;
            d["frame rate"] = +d["frame rate"];
            d["frame rate(est.)"] = +d["frame rate(est.)"];
            // codec: string
            // category: string
            // url: string
            // title: string
            // description: string
            d.hashtags = Array.from(d.hashtags.split(",")).map(s => s.trim()); // string -> string[], it was just one long string
            d.views = +d.views;
            d.likes = +d.likes;
            d.comments = +d.comments;
        });
        return csvData;
    }),
    d3.csv("data/channelrank_data.csv").then(csvData => {
        return prepDataForRVis(csvData);
    })
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


function initMainPage(allDataArray) {
    // For Debugging
    // console.log(allDataArray);

    // ytDashVis = new YtDashboard('ytDashDiv')

    viewsVis = new PieChart('viewsPieChartDiv');
    
    shortsVis = new ShortsVis('shortsChartDiv');

    rankVis = new ChannelRank("rank-list", allDataArray[1]);
    rankVis.initVis();

    engagementVis = new EngagementVis('rulesChartArea', allDataArray[0]);

    heatmapVis = new HeatmapVis('heatmap-chart', allDataArray[0]);
    heatmapVis.initVis();

}

// Data Preparation for Ranking Vis
function prepDataForRVis(csvData) {
    let preparedData = {
        countries: [],
        rankings: {}
    };

    preparedData.countries = csvData.columns;

    preparedData.countries.forEach(country => {
        const rankings = csvData.map(row => row[country]).filter(d => d && d.trim() !== "");
        preparedData.rankings[country] = rankings;
    })

    return preparedData;
}

// Accessors for YT Shorts Vis
function startShortsTimer() { shortsVis.renderVis(); }
function resetShortsVis() { shortsVis.resetVis(); }
function changeShortsView() { shortsVis.changeView(); }
