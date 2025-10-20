let ytDashVis,
    viewsVis;

let promises = [
    // d3.csv("data/youtube_data.csv")
];

function initMainPage(allDataArray) {


    ytDashVis = new YtDashboard('ytDashDiv')

    viewsVis = new PieChart('viewsPieChartDiv')

}