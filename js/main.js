let ytDashVis,
    viewsVis;

let promises = [
    d3.csv("data/youtube_data.csv")
];

function initMainPage(allDataArray) {


    ytDashVis = new ytDash('ytDashDiv')

    viewsVis = new viewsPieChart('viewsPieChartDiv')

}