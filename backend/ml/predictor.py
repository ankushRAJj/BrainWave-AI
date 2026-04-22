import os
import pickle
import re

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

class PersonalityPredictor:
    def __init__(self):
        self.vectorizer = None
        self.models = None
        self._load_models()

    def _load_models(self):
        vec_path = os.path.join(MODELS_DIR, 'vectorizer.pkl')
        mod_path = os.path.join(MODELS_DIR, 'models.pkl')
        
        if not os.path.exists(vec_path) or not os.path.exists(mod_path):
            raise FileNotFoundError("Models not found. Please run train_model.py first.")
            
        with open(vec_path, 'rb') as f:
            self.vectorizer = pickle.load(f)
            
        with open(mod_path, 'rb') as f:
            self.models = pickle.load(f)

    def preprocess(self, text):
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        return text

    def predict(self, text):
        clean_text = self.preprocess(text)
        vec_text = self.vectorizer.transform([clean_text])
        
        results = {}
        for trait, model in self.models.items():
            # Get probability of the positive class (1)
            prob = model.predict_proba(vec_text)[0][1]
            # Convert to a 0-100 score
            results[trait] = round(prob * 100, 2)
            
        return self._format_results(results)

    def _format_results(self, scores):
        # Calculate personality type (Introvert vs Extrovert based on E score)
        e_score = scores['E']
        if e_score > 60:
            p_type = "Extrovert"
        elif e_score < 40:
            p_type = "Introvert"
        else:
            p_type = "Ambivert"
            
        # Determine strengths and weaknesses based on high/low traits
        strengths = []
        weaknesses = []
        
        if scores['O'] > 50: strengths.append("Creative and Open-minded")
        else: weaknesses.append("Resistant to change")
        
        if scores['C'] > 50: strengths.append("Organized and Reliable")
        else: weaknesses.append("Prone to disorganization")
        
        if scores['E'] > 50: strengths.append("Sociable and Energetic")
        else: weaknesses.append("May struggle in highly social environments")
        
        if scores['A'] > 50: strengths.append("Empathetic and Cooperative")
        else: weaknesses.append("Can be overly critical or competitive")
        
        if scores['N'] < 50: strengths.append("Emotionally Stable")
        else: weaknesses.append("Prone to stress and anxiety")
        
        # Career suggestions based on dominant trait
        dominant_trait = max(scores, key=scores.get)
        careers = {
            'O': ["Designer", "Writer", "Artist", "Entrepreneur"],
            'C': ["Accountant", "Project Manager", "Engineer", "Scientist"],
            'E': ["Salesperson", "PR Manager", "Event Planner", "Teacher"],
            'A': ["Counselor", "Nurse", "HR Manager", "Social Worker"],
            'N': ["Data Analyst", "Freelancer", "Researcher", "Archivist"] # Careers with low stress/high independence
        }
        
        return {
            "scores": {
                "Openness": scores['O'],
                "Conscientiousness": scores['C'],
                "Extraversion": scores['E'],
                "Agreeableness": scores['A'],
                "Neuroticism": scores['N']
            },
            "personality_type": p_type,
            "strengths": strengths[:3],  # Top 3
            "weaknesses": weaknesses[:3],
            "career_suggestions": careers.get(dominant_trait, ["Generalist"]),
            "confidence_score": round((max(scores.values()) + (100 - min(scores.values()))) / 2, 2)
        }

if __name__ == '__main__':
    predictor = PersonalityPredictor()
    res = predictor.predict("I love meeting new people but I get anxious sometimes.")
    print(res)
