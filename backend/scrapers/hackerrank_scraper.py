import requests

def scrape_hackerrank(handle):
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(f"https://www.hackerrank.com/rest/contests/master/hackers/{handle}/profile", headers=headers)
    
    if resp.status_code != 200:
        raise Exception("HackerRank user not found or rate limited.")
        
    data = resp.json()
    model = data.get('model', {})
    
    if not model:
        raise Exception("HackerRank user profile is empty.")
        
    return {
        "platform": "HackerRank",
        "handle": handle,
        "score": model.get('score', 0),
        "level": model.get('level', 1),
        "badges": len(model.get('badges', [])),
        "followers_count": model.get('followers_count', 0),
        "posts": [],
        "hashtags": []
    }
