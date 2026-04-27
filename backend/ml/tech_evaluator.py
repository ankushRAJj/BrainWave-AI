class TechEvaluator:
    def __init__(self):
        pass
        
    def evaluate(self, data):
        platform = data.get('platform', '').lower()
        
        if platform == 'github':
            return self._evaluate_github(data)
        elif platform == 'leetcode':
            return self._evaluate_leetcode(data)
        elif platform == 'codeforces':
            return self._evaluate_codeforces(data)
        elif platform == 'hackerrank':
            return self._evaluate_hackerrank(data)
        else:
            raise Exception("Unsupported platform for technical evaluation.")
            
    def _evaluate_github(self, data):
        score = 0
        strengths = []
        weaknesses = []
        
        followers = data.get('friend_count', 0)
        repos = data.get('public_repos', 0)
        stars = data.get('total_stars', 0)
        forks = data.get('total_forks', 0)
        lang_dist = data.get('language_distribution', {})
        
        repo_score = min(repos * 2, 30)
        score += repo_score
        star_score = min(stars * 5, 40)
        score += star_score
        fork_score = min(forks * 2, 15)
        score += fork_score
        follower_score = min(followers * 2, 15)
        score += follower_score
        
        if score > 80: level = "Open Source Veteran"
        elif score > 50: level = "Advanced Developer"
        elif score > 25: level = "Intermediate Developer"
        else: level = "Junior Developer"
            
        if stars > 10: strengths.append("High community engagement (Stars)")
        if len(lang_dist) >= 3: strengths.append("Polyglot Developer (Multiple languages)")
        if repos > 15: strengths.append("Active contributor")
        if len(strengths) == 0: strengths.append("Building foundational skills")
            
        if repos < 5: weaknesses.append("Needs more public projects")
        if stars == 0 and repos > 5: weaknesses.append("Projects may lack documentation or visibility")
        if len(lang_dist) <= 1: weaknesses.append("Could benefit from exploring more languages")
        if len(weaknesses) == 0: weaknesses.append("Solid overall profile")
            
        suggestions = []
        if repos < 5: suggestions.append("Create or contribute to more public repositories.")
        elif stars < 5: suggestions.append("Write better READMEs to attract more stars and visibility.")
        else: suggestions.append("Consider contributing to larger established open-source projects.")
            
        return {
            "type": "tech_evaluation",
            "platform": "GitHub",
            "developer_score": min(score, 100),
            "skill_level": level,
            "top_languages": sorted(lang_dist.items(), key=lambda x: x[1], reverse=True)[:5],
            "strengths": strengths[:3],
            "weaknesses": weaknesses[:3],
            "suggestions": suggestions,
            "metrics": {
                "Stars": stars,
                "Repos": repos,
                "Forks": forks
            }
        }

    def _evaluate_leetcode(self, data):
        score = 0
        strengths = []
        weaknesses = []
        
        easy = data.get('easy_solved', 0)
        medium = data.get('medium_solved', 0)
        hard = data.get('hard_solved', 0)
        total = data.get('total_solved', 0)
        
        score += min(easy * 0.1, 20)
        score += min(medium * 0.5, 40)
        score += min(hard * 1.5, 40)
        
        if score > 80: level = "Algorithm Expert"
        elif score > 50: level = "Advanced Problem Solver"
        elif score > 20: level = "Intermediate Coder"
        else: level = "Beginner"
        
        if hard > 20: strengths.append("Strong ability in complex algorithms (Hard problems)")
        if medium > 100: strengths.append("Consistent problem solver")
        if total > 300: strengths.append("Highly dedicated to practice")
        if len(strengths) == 0: strengths.append("Building foundational algorithmic skills")
        
        if total < 50: weaknesses.append("Needs more practice volume")
        if hard == 0 and total > 100: weaknesses.append("Should start tackling Hard problems")
        if medium == 0 and easy > 50: weaknesses.append("Should transition from Easy to Medium problems")
        if len(weaknesses) == 0: weaknesses.append("Solid problem-solving profile")
        
        suggestions = []
        if total < 50: suggestions.append("Set a goal to solve 1 problem daily to build consistency.")
        elif hard < 5: suggestions.append("Start tackling Hard problems to improve complex algorithmic thinking.")
        else: suggestions.append("Participate in LeetCode weekly contests to improve speed under pressure.")
        
        return {
            "type": "tech_evaluation",
            "platform": "LeetCode",
            "developer_score": min(round(score), 100),
            "skill_level": level,
            "strengths": strengths[:3],
            "weaknesses": weaknesses[:3],
            "suggestions": suggestions,
            "metrics": {
                "Easy": easy,
                "Medium": medium,
                "Hard": hard
            }
        }
        
    def _evaluate_codeforces(self, data):
        score = 0
        strengths = []
        weaknesses = []
        
        rating = data.get('rating', 0)
        rank = data.get('rank', 'Unrated')
        
        score = (rating / 3000) * 100
        
        if rating > 2100: level = "Master Level Competitive Programmer"
        elif rating > 1600: level = "Advanced Competitive Programmer"
        elif rating > 1200: level = "Intermediate Competitor"
        else: level = "Novice Competitor"
        
        if rating > 1600: strengths.append(f"Strong rating ({rating}) indicating deep algorithmic knowledge")
        if data.get('max_rating', 0) > rating + 100: strengths.append(f"Has achieved high peaks (Max: {data.get('max_rating')})")
        if len(strengths) == 0: strengths.append("Active participant in competitive programming")
        
        if rating < 1000: weaknesses.append("Needs more contest experience to build rating")
        if len(weaknesses) == 0: weaknesses.append("Consistent competitive performance")
        
        suggestions = []
        if rating < 1200: suggestions.append("Practice virtual contests to improve your speed and debugging.")
        elif rating < 1600: suggestions.append("Focus on dynamic programming and advanced graph algorithms.")
        else: suggestions.append("Compete consistently to reach the next rank tier.")
        
        return {
            "type": "tech_evaluation",
            "platform": "Codeforces",
            "developer_score": min(round(score), 100),
            "skill_level": level,
            "strengths": strengths[:3],
            "weaknesses": weaknesses[:3],
            "suggestions": suggestions,
            "metrics": {
                "Rating": rating,
                "Max Rating": data.get('max_rating', 0),
                "Friends": data.get('friend_count', 0)
            }
        }

    def _evaluate_hackerrank(self, data):
        score = 0
        strengths = []
        weaknesses = []
        
        hr_score = data.get('score', 0)
        badges = data.get('badges', 0)
        
        score = min(hr_score / 100, 70) + min(badges * 5, 30)
        
        if score > 80: level = "HackerRank Expert"
        elif score > 50: level = "Advanced Coder"
        elif score > 20: level = "Intermediate Developer"
        else: level = "Beginner"
        
        if badges > 5: strengths.append("Earned multiple skill badges")
        if hr_score > 1000: strengths.append("High overall HackerRank score")
        if len(strengths) == 0: strengths.append("Active on HackerRank")
        
        if badges == 0: weaknesses.append("Consider earning domain badges (e.g. Python, SQL)")
        if hr_score < 100: weaknesses.append("Needs more practice on HackerRank challenges")
        if len(weaknesses) == 0: weaknesses.append("Solid HackerRank profile")
        
        suggestions = []
        if badges == 0: suggestions.append("Complete the '30 Days of Code' challenge to earn your first badge.")
        elif hr_score < 500: suggestions.append("Focus on specific domain tracks like Algorithms or Data Structures.")
        else: suggestions.append("Participate in HackerRank hiring challenges and company-sponsored contests.")
        
        return {
            "type": "tech_evaluation",
            "platform": "HackerRank",
            "developer_score": min(round(score), 100),
            "skill_level": level,
            "strengths": strengths[:3],
            "weaknesses": weaknesses[:3],
            "suggestions": suggestions,
            "metrics": {
                "HR Score": round(hr_score),
                "Badges": badges,
                "Followers": data.get('followers_count', 0)
            }
        }
