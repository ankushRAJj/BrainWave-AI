import requests

def scrape_codeforces(handle):
    resp = requests.get(f"https://codeforces.com/api/user.info?handles={handle}")
    if resp.status_code != 200:
        raise Exception("Failed to connect to Codeforces API.")
        
    data = resp.json()
    if data.get('status') != 'OK' or not data.get('result'):
        raise Exception("Codeforces user not found.")
        
    user = data['result'][0]
    
    return {
        "platform": "Codeforces",
        "handle": handle,
        "rating": user.get('rating', 0),
        "max_rating": user.get('maxRating', 0),
        "rank": user.get('rank', 'Unrated'),
        "max_rank": user.get('maxRank', 'Unrated'),
        "friend_count": user.get('friendOfCount', 0),
        "posts": [],
        "hashtags": []
    }
