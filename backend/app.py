from flask import Flask, request, jsonify
from flask_cors import CORS
from ml.predictor import PersonalityPredictor

app = Flask(__name__)
# Enable CORS for the React frontend (usually runs on port 5173 for Vite)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize ML Predictor
try:
    predictor = PersonalityPredictor()
    print("ML Models loaded successfully.")
except FileNotFoundError as e:
    print(f"Warning: {e}")
    print("Please run backend/ml/train_model.py to generate models.")
    predictor = None

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": predictor is not None}), 200

@app.route('/api/predict', methods=['POST'])
def predict_personality():
    if predictor is None:
        return jsonify({"error": "ML models are not loaded. Server setup incomplete."}), 500

    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data['text']
    
    if len(text.strip()) < 10:
        return jsonify({"error": "Please provide more text (at least a few sentences) for an accurate prediction."}), 400

    try:
        results = predictor.predict(text)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict_social', methods=['POST'])
def predict_social():
    if predictor is None:
        return jsonify({"error": "ML models are not loaded. Server setup incomplete."}), 500

    data = request.json
    if not data or 'platform' not in data or 'handle' not in data or 'mock_data' not in data:
        return jsonify({"error": "Missing required social media data"}), 400

    mock_data = data['mock_data']
    posts = mock_data.get('posts', [])
    hashtags = mock_data.get('hashtags', [])
    friend_count = mock_data.get('friend_count')
    platform = data.get('platform')

    # Combine text data for the NLP model
    combined_text = " ".join(posts) + " " + " ".join(hashtags)
    
    if len(combined_text.strip()) < 10:
        # Fallback text if mock data is too short
        combined_text += " I am a user on this platform."

    try:
        if platform.lower() in ['github', 'leetcode', 'codeforces', 'hackerrank']:
            from ml.tech_evaluator import TechEvaluator
            evaluator = TechEvaluator()
            results = evaluator.evaluate(mock_data)
        else:
            results = predictor.predict(combined_text, friend_count=friend_count, platform=platform)
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scrape_social', methods=['POST'])
def scrape_social():
    data = request.json
    if not data or 'platform' not in data or 'handle' not in data:
        return jsonify({"error": "Missing platform or handle"}), 400
        
    platform = data['platform'].lower()
    handle = data['handle']
    
    try:
        if platform == 'github':
            from scrapers.github_scraper import scrape_github
            result = scrape_github(handle)
        elif platform == 'leetcode':
            from scrapers.leetcode_scraper import scrape_leetcode
            result = scrape_leetcode(handle)
        elif platform == 'codeforces':
            from scrapers.codeforces_scraper import scrape_codeforces
            result = scrape_codeforces(handle)
        elif platform == 'hackerrank':
            from scrapers.hackerrank_scraper import scrape_hackerrank
            result = scrape_hackerrank(handle)
        else:
            return jsonify({"error": f"Scraping for {platform} is not supported."}), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Use Waitress for production-ready serving locally, or Flask dev server
    print("Starting Flask API Server on port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
