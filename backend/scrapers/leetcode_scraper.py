import requests

def scrape_leetcode(handle):
    url = "https://leetcode.com/graphql"
    query = """
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
          reputation
        }
      }
    }
    """
    variables = {"username": handle}
    resp = requests.post(url, json={"query": query, "variables": variables})
    
    if resp.status_code != 200:
        raise Exception("Failed to fetch LeetCode profile.")
        
    data = resp.json()
    if not data.get('data') or not data['data'].get('matchedUser'):
        raise Exception("LeetCode user not found.")
        
    matched = data['data']['matchedUser']
    stats = matched.get('submitStats', {}).get('acSubmissionNum', [])
    
    easy = 0
    medium = 0
    hard = 0
    for s in stats:
        if s['difficulty'] == 'Easy': easy = s['count']
        elif s['difficulty'] == 'Medium': medium = s['count']
        elif s['difficulty'] == 'Hard': hard = s['count']
        
    profile = matched.get('profile', {})
    
    return {
        "platform": "LeetCode",
        "handle": handle,
        "easy_solved": easy,
        "medium_solved": medium,
        "hard_solved": hard,
        "total_solved": easy + medium + hard,
        "ranking": profile.get('ranking', 0),
        "reputation": profile.get('reputation', 0),
        "posts": [],
        "hashtags": []
    }
