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
        console.log("Youtube Data Loaded"); 
        return csvData;
    }),
    d3.csv("data/youtube_channel_popularity.csv").then(csvData => {
        return prepDataForRVis(csvData);
    }),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


function initMainPage(allDataArray) {
    // For Debugging
    // console.log(allDataArray);

    ytDashVis = new YtDashboard("ytDashDiv", allDataArray[0]);

    viewsVis = new PieChart('viewsPieChartDiv', allDataArray[0]);

    shortsVis = new ShortsVis('shortsChartDiv', allDataArray[0]);
    shortsObserver.observe(document.getElementById('shortsChartDiv'));

    rankVis = new ChannelRank("rank-list", allDataArray[1], allDataArray[2]);

    engagementVis = new EngagementVis('rulesChartArea', allDataArray[0]);

    heatmapVis = new HeatmapVis('heatmap-chart', allDataArray[0]);
    heatmapVis.initVis();

}

// Data Preparation for Ranking Vis
function prepDataForRVis(csvData) {
    let preparedData = {
        rankings: {}
    };

   csvData.forEach(row => {
       let country = row.Countries.trim();

       let channels = row.Channels
           .replace(/[\[\]]/g, "")
           .split(",")
           .map(d => d.trim());

       let subscribers = row.Subscribers
           .replace(/[\[\]]/g, "")
           .split(",")
           .map(d => convertToNumber(d.trim()));

       let paired = channels.map((c, i) => ({
           name: c,
           subs: subscribers[i] || 0
       }));

       paired.sort((a, b) => b.subs - a.subs);

       let totalSubs = paired.reduce((a, b) => a + b.subs, 0);

       preparedData.rankings[country] = {
           country: country,
           topChannels: paired,
           totalSubs: totalSubs
       };
   });

   return preparedData;
}

function convertToNumber(str) {
    if (str.endsWith("M")) return parseFloat(str) * 1_000_000;
    if (str.endsWith("K")) return parseFloat(str) * 1_000;
    return parseFloat(str) || 0;
}

// Accessors for YT Shorts Vis
function startShortsVis() { shortsVis.start() }
function pauseShortsVis() { shortsVis.pause() }
function resetShortsVis() { shortsVis.reset() }


// Accessors for Engagement Vis
function changeEngCategory() { 
    let categorySelector = document.getElementById('categorySelector');
    engagementVis.changeCategory(categorySelector.value);
}