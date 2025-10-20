let ytDashVis,
    viewsVis,
    rankVis,
    shortsVis;

// let promises = [
//     d3.csv("data/youtube_data.csv")
// ];

loadRankData();


// Promise.all(promises)
//     .then( function(){ initMainPage(null) })
//     .catch( function (err){console.log(err)} );

function initMainPage(allDataArray) {


    // ytDashVis = new YtDashboard('ytDashDiv')

    // viewsVis = new PieChart('viewsPieChartDiv')
    
    shortsVis = new ShortsVis('shortsChartDiv');

}

initMainPage(null);

function loadRankData() {
    d3.csv("data/channelrank_data.csv").then(csvData => {
        let data = prepDataForRVis(csvData);

        console.log(data);

        rankVis = new ChannelRank("rank-list", data);
        rankVis.initVis();

    })

}

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

function startShortsTimer() { shortsVis.renderVis(); }
function resetShortsVis() { shortsVis.resetVis(); }
function changeShortsView() { shortsVis.changeView(); }
