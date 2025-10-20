let ytDashVis,
    viewsVis,
    shortsVis;

let promises = [
    //d3.csv("data/youtube_data.csv")
];


// Promise.all(promises)
//     .then( function(){ initMainPage(null) })
//     .catch( function (err){console.log(err)} );

function initMainPage(allDataArray) {


    // ytDashVis = new YtDashboard('ytDashDiv')

    // viewsVis = new PieChart('viewsPieChartDiv')

    shortsVis = new ShortsVis('shortsChartDiv');

}

initMainPage(null);

function startShortsTimer() { shortsVis.renderVis(); }
function resetShortsVis() { shortsVis.resetVis(); }
function changeShortsView() { shortsVis.changeView(); }
