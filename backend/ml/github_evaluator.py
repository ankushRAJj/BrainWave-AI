class GitHubEvaluator:
    def __init__(self):
        pass
        
    def evaluate(self, github_data):
        score = 0
        strengths = []
        weaknesses = []
        
        followers = github_data.get('friend_count', 0)
        repos = github_data.get('public_repos', 0)
        stars = github_data.get('total_stars', 0)
        forks = github_data.get('total_forks', 0)
        lang_dist = github_data.get('language_distribution', {})
        
        # Base score from repos (up to 30)
        repo_score = min(repos * 2, 30)
        score += repo_score
        
        # Star score (up to 40)
        star_score = min(stars * 5, 40)
        score += star_score
        
        # Fork score (up to 15)
        fork_score = min(forks * 2, 15)
        score += fork_score
        
        # Follower score (up to 15)
        follower_score = min(followers * 2, 15)
        score += follower_score
        
        # Determine Skill Level
        if score > 80:
            level = "Open Source Veteran"
        elif score > 50:
            level = "Advanced Developer"
        elif score > 25:
            level = "Intermediate Developer"
        else:
            level = "Junior Developer"
            
        # Strengths
        if stars > 10:
            strengths.append("High community engagement (Stars)")
        if len(lang_dist) >= 3:
            strengths.append("Polyglot Developer (Multiple languages)")
        if repos > 15:
            strengths.append("Active contributor")
            
        if len(strengths) == 0:
            strengths.append("Building foundational skills")
            
        # Weaknesses
        if repos < 5:
            weaknesses.append("Needs more public projects")
        if stars == 0 and repos > 5:
            weaknesses.append("Projects may lack documentation or visibility")
        if len(lang_dist) <= 1:
            weaknesses.append("Could benefit from exploring more languages")
            
        if len(weaknesses) == 0:
            weaknesses.append("Solid overall profile")
            
        return {
            "type": "github_evaluation",
            "developer_score": min(score, 100),
            "skill_level": level,
            "top_languages": sorted(lang_dist.items(), key=lambda x: x[1], reverse=True)[:5],
            "strengths": strengths[:3],
            "weaknesses": weaknesses[:3],
            "metrics": {
                "stars": stars,
                "repos": repos,
                "forks": forks,
                "followers": followers
            }
        }
