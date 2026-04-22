import os
import pandas as pd
import numpy as np
import pickle
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.multioutput import MultiOutputClassifier

# Ensure models directory exists
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_mock_data(csv_path):
    """
    Generates a mock dataset if the user doesn't have one yet.
    In a real scenario, this would be replaced by actual data (e.g., Big Five Essays dataset).
    Labels are binary: 1 (high trait) or 0 (low trait).
    """
    print(f"Generating mock dataset at {csv_path}...")
    
    # Some sample phrases indicative of traits
    data = [
        {"text": "I love going out to parties and meeting new people! It gives me so much energy.", "O": 1, "C": 0, "E": 1, "A": 1, "N": 0},
        {"text": "I prefer staying home and reading a good book. Crowds make me anxious.", "O": 1, "C": 1, "E": 0, "A": 0, "N": 1},
        {"text": "I have a strict schedule and I always keep my desk perfectly organized.", "O": 0, "C": 1, "E": 0, "A": 1, "N": 0},
        {"text": "I feel worried and stressed out very easily over small things.", "O": 0, "C": 0, "E": 0, "A": 0, "N": 1},
        {"text": "I enjoy trying new foods, exploring new cultures, and abstract art.", "O": 1, "C": 0, "E": 1, "A": 1, "N": 0},
        {"text": "I don't really care about other people's feelings, I just want to win.", "O": 0, "C": 1, "E": 1, "A": 0, "N": 0},
        {"text": "I am always prepared and I follow rules strictly.", "O": 0, "C": 1, "E": 0, "A": 1, "N": 0},
        {"text": "I make friends easily and love to chat with anyone.", "O": 1, "C": 0, "E": 1, "A": 1, "N": 0},
        {"text": "I often feel sad and overwhelmed by my emotions.", "O": 1, "C": 0, "E": 0, "A": 1, "N": 1},
        {"text": "I am very creative and have an active imagination.", "O": 1, "C": 0, "E": 0, "A": 1, "N": 1},
    ]
    
    # Duplicate and add noise to make a larger mock dataset
    large_data = []
    for _ in range(20):  # 200 samples total
        for row in data:
            large_data.append(row.copy())
            
    df = pd.DataFrame(large_data)
    df.to_csv(csv_path, index=False)
    print("Mock dataset created.")

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

def train():
    csv_path = os.path.join(os.path.dirname(__file__), 'mock_data.csv')
    
    if not os.path.exists(csv_path):
        generate_mock_data(csv_path)
        
    print("Loading data...")
    df = pd.read_csv(csv_path)
    
    print("Preprocessing text...")
    df['text'] = df['text'].apply(preprocess_text)
    
    X = df['text']
    y = df[['O', 'C', 'E', 'A', 'N']]
    
    print("Training models for OCEAN traits...")
    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    X_vec = vectorizer.fit_transform(X)
    
    # Train separate Logistic Regression models for each trait to get probabilities
    models = {}
    traits = ['O', 'C', 'E', 'A', 'N']
    
    for trait in traits:
        clf = LogisticRegression(random_state=42)
        clf.fit(X_vec, y[trait])
        models[trait] = clf
        print(f"Trained model for trait: {trait}")
        
    print("Saving models...")
    # Save vectorizer
    with open(os.path.join(MODELS_DIR, 'vectorizer.pkl'), 'wb') as f:
        pickle.dump(vectorizer, f)
        
    # Save models
    with open(os.path.join(MODELS_DIR, 'models.pkl'), 'wb') as f:
        pickle.dump(models, f)
        
    print("Training complete! Models saved in 'models/' directory.")

if __name__ == '__main__':
    train()
