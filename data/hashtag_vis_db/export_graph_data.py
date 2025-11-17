import sqlite3
import json

db_path = "/Users/carlosrobinson/Classes/Fall25/CS4460/4460B/data/hashtag_vis_db/hashtag_filter.db"
output_path = "/Users/carlosrobinson/Classes/Fall25/CS4460/4460B/data/hashtag_vis_db/graph_data.json"

connection = sqlite3.connect(db_path)
cursor = connection.cursor()

cursor.execute(
    """
    SELECT hashtags.id, hashtags.name, hashtags.is_english, COUNT(video_hashtags.video_id) AS usage_count
    FROM hashtags
    JOIN video_hashtags ON hashtags.id = video_hashtags.hashtag_id
    GROUP BY hashtags.id
    ORDER BY usage_count DESC
    LIMIT 20
    """
)

top_used_hashtags = cursor.fetchall()
top_used_hashtag_ids = [row[0] for row in top_used_hashtags]

cursor.execute(
    """
    SELECT hashtags.id, hashtags.name, hashtags.is_english, SUM(videos.views) AS total_views
    FROM hashtags
    JOIN video_hashtags ON hashtags.id = video_hashtags.hashtag_id
    JOIN videos ON videos.id = video_hashtags.video_id
    GROUP BY hashtags.id
    ORDER BY total_views DESC
    LIMIT 20
    """
)

top_viewed_hashtags = cursor.fetchall()
top_viewed_hashtag_ids = [row[0] for row in top_viewed_hashtags]

all_hashtag_ids = list(set(top_used_hashtag_ids + top_viewed_hashtag_ids))
top_used_set = set(top_used_hashtag_ids)
top_viewed_set = set(top_viewed_hashtag_ids)
important_hashtags = set(all_hashtag_ids)

cursor.execute(
    """
    SELECT id, title, url, views
    FROM videos
    ORDER BY views DESC
    LIMIT 10
    """
)

top_videos = cursor.fetchall()
top_video_ids = [row[0] for row in top_videos]

videos_for_hashtags = {}


for hashtag_id in all_hashtag_ids:
    cursor.execute(
        """
        SELECT videos.id, videos.title, videos.url, videos.views
        FROM videos
        JOIN video_hashtags ON videos.id = video_hashtags.video_id
        WHERE video_hashtags.hashtag_id = ?
        ORDER BY videos.views DESC
        LIMIT 10
        """, (hashtag_id,)
    )

    video_rows = cursor.fetchall()
    videos_for_hashtags[hashtag_id] = video_rows

hashtags_for_top_videos = {}

for video in top_video_ids:
    cursor.execute(
        """
        SELECT hashtags.id, hashtags.name
        FROM hashtags
        JOIN video_hashtags ON hashtags.id = video_hashtags.hashtag_id
        WHERE video_hashtags.video_id = ?
        """, (video,)
    )
    hashtags_for_top_videos[video] = cursor.fetchall()

    
nodes = []
video_nodes_added = set()

usage_map = {row[0] : row[3] for row in top_used_hashtags}
view_map = {row[0] : row[3] for row in top_viewed_hashtags}

for hashtag_id in all_hashtag_ids:
    name = None
    is_english = None

    for row in top_used_hashtags + top_viewed_hashtags:
        if row[0] == hashtag_id:
            name = row[1]
            is_english = bool(row[2])
            break
    
    nodes.append({
        "id" : f"hashtag_{hashtag_id}",
        "label" : name,
        "usage_count" : usage_map.get(hashtag_id, 0),
        "view_count" : view_map.get(hashtag_id,0),
        "group" : "hashtag",
        "is_english" : bool(is_english)
    })


for hashtag_id, videos in videos_for_hashtags.items():
    for (vid, title, url, views) in videos:
        if vid not in video_nodes_added:
            nodes.append({
                "id" : f"video_{vid}",
                "label" : title,
                "url" : url,
                "views" : views,
                "group" : "video"
            })
            video_nodes_added.add(vid)

for (vid, title, url, views) in top_videos:
    full_tags = hashtags_for_top_videos.get(vid,[])
    top_used_tags = [t for t in full_tags if t[0] in top_used_set]
    top_viewed_tags = [t for t in full_tags if t[0] in top_viewed_set]

    existing_node = next((n for n in nodes if n["id"] == f"video_{vid}"), None)
    if existing_node:
        existing_node["group"] = "video_top"
        existing_node["all_hashtags"] = [{"id" : t[0], "name" : t[1]} for t in full_tags]
        existing_node["top_used_hashtags"] = [{"id" : t[0], "name" : t[1]} for t in top_used_tags]
        existing_node["top_viewed_hashtags"] = [{"id" : t[0], "name" : t[1]} for t in top_viewed_tags]
    else:
        nodes.append({
            "id" : f"video_{vid}",
            "label" : title,
            "url" : url,
            "views" : views,
            "group" : "video_top",
            "all_hashtags" : [{"id" : t[0], "name" : t[1]} for t in full_tags],
            "top_used_hashtags" : [{"id" : t[0], "name" : t[1]} for t in top_used_tags],
            "top_viewed_hashtags" : [{"id" : t[0], "name" : t[1]} for t in top_viewed_tags]
        })
        video_nodes_added.add(vid)

links = []

for hashtag_id, videos in videos_for_hashtags.items():
    for (vid, title, url, views) in videos:
        links.append({
            "source" : f"video_{vid}",
            "target" : f"hashtag_{hashtag_id}"
        })

for vid, full_tag_list in hashtags_for_top_videos.items():
    for (hashtag_id, _) in full_tag_list:
        if hashtag_id in important_hashtags:
            links.append({
                "source" : f"video_{vid}",
                "target" : f"hashtag_{hashtag_id}"
            })

graph = {
    "nodes" : nodes,
    "links" : links
}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2)

connection.close()
print("Export complete")

