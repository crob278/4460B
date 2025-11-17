## Algorithm Folklore: What is Truly Involved in Youtube Popularity?
Link: [(Github Pages](https://crob278.github.io/4460B/)
Video: [Youtube Link](https://youtu.be/ugNi9JWuwLE)

This is an exploration of what metrics are important or unimportant Youtube popularity in the modern age told in a way that challenges commonly held assumptions, sometimes referenced as "Algorithm Folklore."

It contains 6 Visualizations in total:
1. A live area comparison between the time elapsed on this page alone vs the amount of time the whole world is spending on youtube shorts alone
2. A map of Youtube and Youtubers viewership throughout the world
3. A network of tags and their associated viewership and connections.
    For the last two filters, the top 10 overall videos are displayed along with their hashtags are displayed.
    For the top 10 videos' hashtag by frequency, if the video is associated with a hashtag that is amongst the top 20 
    most used(that being associated with a lot of videos), those hashtags appears in the visualization.
   For the top 10 videos' hashtag by views, if the video is associated with a hashtag that is amongst the top 20
   most viewed(that being the total amount of views every video associated with that hashtag), those hashtags appears in the 
   visualization. Note: In the screen record video there was a typo for the last filter that read top 10 videos' hashtag by usage,
   this has now been changed to top 10 videos' hashtag by views.
4. A pie chart of video length ranges weighted by their associated viewership
5. A linked view of category viewership by length and their portions of the whole
    (The timecode bar is a slider that progresses the vis)
6. A scatterplot of likes vs comments vs views (size & color) by category
    (Each bubble is clickable and opens the related video in a new tab)

### Libraries Used
D3.js [https://d3js.org/]
Bootstrap 5 [https://getbootstrap.com/]
Google Fonts (Roboto) [https://fonts.google.com/specimen/Roboto]
