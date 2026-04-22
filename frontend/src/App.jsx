import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Moon, Sun, Upload, Send, Activity, History } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Load history and theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedHistory = JSON.parse(localStorage.getItem('personality_history') || '[]');
    setHistory(savedHistory);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(file);
    }
  };

  const analyzeText = async () => {
    if (text.trim().length < 10) {
      setError('Please enter a slightly longer text for accurate analysis.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Use environment variable for remote deployment (Vercel -> Render)
      // Fallback to relative path for local Docker/Vite proxy
      const apiUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/predict` 
        : '/api/predict';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze text');
      }
      
      setResults(data);
      
      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        text: text.substring(0, 100) + '...',
        personality: data.personality_type,
        data: data
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 5); // Keep last 5
      setHistory(updatedHistory);
      localStorage.setItem('personality_history', JSON.stringify(updatedHistory));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format data for Recharts Radar
  const getChartData = () => {
    if (!results) return [];
    const { scores } = results;
    return [
      { subject: 'Openness', A: scores.Openness, fullMark: 100 },
      { subject: 'Conscientiousness', A: scores.Conscientiousness, fullMark: 100 },
      { subject: 'Extraversion', A: scores.Extraversion, fullMark: 100 },
      { subject: 'Agreeableness', A: scores.Agreeableness, fullMark: 100 },
      { subject: 'Neuroticism', A: scores.Neuroticism, fullMark: 100 },
    ];
  };

  const loadFromHistory = (item) => {
    setResults(item.data);
    setText(item.text); // Note: Only shows partial text if we sliced it, but for demo it's fine
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Background Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header>
        <div className="logo">
          <h1>BrainWave AI</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="main-content">
        {/* Left Column: Input */}
        <section className="input-section glass-card">
          <h2>Discover Your Personality</h2>
          <p>Enter a text, blog post, or social media caption to analyze your Big Five personality traits.</p>
          
          <textarea 
            placeholder="I love exploring new places and meeting interesting people, but sometimes I need to recharge in quiet..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          
          {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <label className="file-upload" style={{ flex: 1 }}>
              <Upload size={20} />
              <span>Upload .txt</span>
              <input type="file" accept=".txt" onChange={handleFileUpload} />
            </label>
            
            <button 
              className="btn-primary" 
              onClick={analyzeText} 
              disabled={loading || text.length === 0}
              style={{ flex: 2 }}
            >
              {loading ? <div className="spinner"></div> : <><Send size={20} /> Analyze Text</>}
            </button>
          </div>
        </section>

        {/* Right Column: Results */}
        <section className="results-section glass-card">
          {!results ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', opacity: 0.5 }}>
              <Activity size={48} style={{ marginBottom: '1rem' }} />
              <p>Your analysis results will appear here</p>
            </div>
          ) : (
            <>
              <div className="personality-header">
                <h3>You are an</h3>
                <div className="personality-type">{results.personality_type}</div>
                <div className="confidence">AI Confidence Score: {results.confidence_score}%</div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getChartData()}>
                    <PolarGrid stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-primary)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--accent-primary)' }}
                    />
                    <Radar name="Score" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="traits-grid">
                <div className="trait-box strengths">
                  <h4>Key Strengths</h4>
                  <ul>
                    {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="trait-box weaknesses">
                  <h4>Potential Weaknesses</h4>
                  <ul>
                    {results.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              <div className="careers">
                <h4>Suggested Career Paths</h4>
                <div className="career-tags">
                  {results.career_suggestions.map((c, i) => (
                    <span key={i} className="tag">{c}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* History Section */}
      {history.length > 0 && (
        <section className="history-section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} /> Recent Analyses
          </h2>
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="glass-card history-card" onClick={() => loadFromHistory(item)}>
                <h4>{item.personality}</h4>
                <p>"{item.text}"</p>
                <div className="history-date">{item.date}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
