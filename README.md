# Personality Predictor from Text using Machine Learning

![UI Preview](https://via.placeholder.com/1000x500.png?text=BrainWave+AI+UI+Preview)

A full-stack, industry-level web application that predicts a user's personality traits based on their text input (e.g., social media posts, essays) using the **Big Five Personality Traits (OCEAN)** model.

## 🚀 Features
- **Machine Learning**: Predicts 5 distinct personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) using TF-IDF and Logistic Regression.
- **Deep Insights**: Calculates overarching personality type (Introvert/Extrovert/Ambivert), key strengths, weaknesses, and potential career paths.
- **Premium UI**: Modern, glassmorphism-inspired interface with seamless Light/Dark mode toggling.
- **Interactive Visualizations**: Real-time rendering of a Radar chart based on personality scores.
- **Multiple Inputs**: Supports typing raw text or uploading `.txt` files.
- **History Tracking**: Automatically saves recent analyses to local storage so you never lose past insights.
- **DevOps Ready**: Fully containerized using Docker and Docker Compose, with automated CI/CD via GitHub Actions.

## 💻 Tech Stack
- **Frontend**: React.js, Vite, Recharts, Nginx (for Docker reverse proxying).
- **Backend**: Python, Flask, Flask-CORS, Waitress.
- **Machine Learning**: Scikit-learn, Pandas, NumPy.
- **DevOps**: Docker, Docker Compose, GitHub Actions.

## 🐳 Running with Docker (Recommended)

The easiest way to run this application is using Docker. You don't need Python or Node.js installed locally!

1. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.
2. Open a terminal in the root directory of this project.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Wait for the containers to spin up. The backend will automatically train the ML models during the build process.
5. Open your browser and go to `http://localhost`. (Nginx automatically routes traffic between the React frontend and Flask backend).

## 🛠️ How to Run Locally (Without Docker)

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. **Important**: Train the ML model to generate the `.pkl` files!
   ```bash
   python ml/train_model.py
   ```
5. Start the Flask server:
   ```bash
   python app.py
   ```
   *The server will run on http://localhost:5000*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The app will run on http://localhost:5173*

## 🔄 CI/CD Pipeline
This project includes a **GitHub Actions** workflow (`.github/workflows/ci.yml`). Every time you push to the `main` branch, it automatically:
- Installs Python and Node dependencies.
- Runs the ML training script to verify model generation.
- Builds the React application.
- Tests the Docker Compose build configuration.
