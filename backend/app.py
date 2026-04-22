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

if __name__ == '__main__':
    # Use Waitress for production-ready serving locally, or Flask dev server
    print("Starting Flask API Server on port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
