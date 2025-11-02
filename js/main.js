let ytDashVis,
    viewsVis,
    rankVis,
    shortsVis,
    engagementVis;

// Load Data with Promises
let promises = [
    d3.csv("data/youtube_data.csv"),
    d3.csv("data/channelrank_data.csv").then(csvData => {
        return prepDataForRVis(csvData);
    })
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


function initMainPage(allDataArray) {


    // ytDashVis = new YtDashboard('ytDashDiv')

    viewsVis = new PieChart('viewsPieChartDiv');
    
    shortsVis = new ShortsVis('shortsChartDiv');

    rankVis = new ChannelRank("rank-list", allDataArray[1]);
    rankVis.initVis();

    engagementVis = new EngagementVis('rulesChartArea', allDataArray[0]);

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
