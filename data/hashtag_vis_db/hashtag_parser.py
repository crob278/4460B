import csv
import sqlite3
import unicodedata


db_path = "/Users/carlosrobinson/Classes/Fall25/CS4460/4460B/data/hashtag_vis_db/hashtag_filter.db"
csv_path = "youtube_data.csv"

def clean_hashtag(tag: str) -> str:
    tag = tag.strip().strip(' " ').strip()
    tag = unicodedata.normalize("NFKC", tag)
    tag = tag.lower()
    return tag

def is_english(tag: str) -> bool:
    return tag.encode("ascii", "ignore").decode("ascii") == tag

def import_csv():
    print("Opening DB at:", db_path)
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    with open(csv_path, newline='', encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            title = row.get("title", "")
            url = row.get("url", "")
            views_raw = row.get("views", "0")
            try:
                views = int(views_raw)
            except ValueError:
                views = 0
            
            cursor.execute(
                "INSERT INTO videos (title, url, views) VALUES (?, ?, ?)",
                (title, url, views)
            )
            video_pk = cursor.lastrowid

            raw_tags = row.get("hashtags", "")

            if not raw_tags.strip():
                continue

            tags = [clean_hashtag(t) for t in raw_tags.split(",") if t.strip()]

            for tag in tags:
                english_flag = is_english(tag)

                cursor.execute(
                    "INSERT OR IGNORE INTO hashtags (name, is_english) VALUES (?, ?)",
                    (tag, english_flag)
                )

                cursor.execute("SELECT id FROM hashtags WHERE name = ?", (tag,))
                hashtag_pk = cursor.fetchone()[0]

                cursor.execute(
                    "INSERT OR IGNORE INTO video_hashtags (video_id, hashtag_id) VALUES (?, ?)",
                    (video_pk, hashtag_pk)
                )

        print("All finished")  
        connection.commit()
        connection.close()
    

if __name__ == "__main__":
    import_csv()