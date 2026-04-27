import requests
import os
from collections import Counter

def scrape_github(handle):
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    # Add authentication if token is provided to avoid rate limits
    github_token = os.environ.get("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"
        
    # Get user profile
    user_resp = requests.get(f"https://api.github.com/users/{handle}", headers=headers)
    if user_resp.status_code != 200:
        raise Exception("GitHub user not found or API rate limit exceeded.")
        
    user_data = user_resp.json()
    
    # Get user repos (up to 30)
    repos_resp = requests.get(f"https://api.github.com/users/{handle}/repos?sort=updated&per_page=30", headers=headers)
    repos_data = []
    if repos_resp.status_code == 200:
        repos_data = repos_resp.json()
        
    posts_text = []
    languages = []
    total_stars = 0
    total_forks = 0
    
    if user_data.get('bio'):
        posts_text.append(user_data['bio'])
        
    for repo in repos_data:
        # Don't evaluate forked repos as heavily, but include them
        if not repo.get('fork', False):
            total_stars += repo.get('stargazers_count', 0)
            total_forks += repo.get('forks_count', 0)
            
        if repo.get('description'):
            posts_text.append(repo['description'])
        if repo.get('language'):
            languages.append(repo['language'])
            
    # Calculate language distribution
    lang_counts = Counter(languages)
    total_repos_with_lang = len(languages)
    language_distribution = {}
    if total_repos_with_lang > 0:
        for lang, count in lang_counts.items():
            language_distribution[lang] = round((count / total_repos_with_lang) * 100, 1)
            
    return {
        "platform": "GitHub",
        "handle": handle,
        "friend_count": user_data.get('followers', 0),
        "public_repos": user_data.get('public_repos', 0),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "language_distribution": language_distribution,
        "posts": posts_text,
        "is_private": False
    }
