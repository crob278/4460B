let ytDashVis,
    viewsVis,
    shortsVis;

let promises = [
    d3.csv("data/youtube_data.csv")
];

function initMainPage(allDataArray) {


    ytDashVis = new YtDashboard('ytDashDiv')

    viewsVis = new PieChart('viewsPieChartDiv')

    shortsVis = new ShortsVis('shortsChartDiv');

}

function resetShortsVis() {
    shortsVis.resetVis();
}
