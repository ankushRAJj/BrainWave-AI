import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Moon, Sun, Upload, Send, Activity, History, Share2, User, Hash, Users, Database, Search, FileJson } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('qa'); // 'qa' or 'social'
  
  // QA State
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  
  // Social State
  const [socialPlatform, setSocialPlatform] = useState('GitHub');
  const [socialHandle, setSocialHandle] = useState('');
  const [mockSocialData, setMockSocialData] = useState(null);
  const [fetchingSocial, setFetchingSocial] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

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

  const questions = [
    "If you had a completely free day with no obligations, how would you choose to spend it?",
    "How do you usually approach a large, complex project or a messy room?",
    "How do you feel after spending a few hours at a crowded, energetic social event?",
    "When a friend or colleague comes to you with a problem they are struggling with, what is your typical response?",
    "How do you typically react when things don't go according to plan and you face unexpected setbacks?"
  ];

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const fetchRealSocialData = async () => {
    if (!socialHandle.trim()) {
      setError("Please enter a handle first.");
      return;
    }
    setError('');
    setFetchingSocial(true);
    setMockSocialData(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/scrape_social` : '/api/scrape_social';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: socialPlatform, handle: socialHandle })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch social data');
      
      setMockSocialData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingSocial(false);
    }
  };



  const analyzeText = async () => {
    const combinedText = answers.join(' ').trim();
    if (combinedText.length < 20) {
      setError('Please provide slightly longer answers for an accurate analysis.');
      return;
    }
    await performAnalysis('/api/predict', { text: combinedText });
  };

  const analyzeSocial = async () => {
    if (!mockSocialData) return;
    await performAnalysis('/api/predict_social', {
      platform: socialPlatform,
      handle: socialHandle,
      mock_data: mockSocialData
    });
  };

  const performAnalysis = async (endpoint, payload) => {
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}${endpoint}` 
        : endpoint;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze');
      }
      
      setResults(data);
      const historyText = payload.text ? payload.text.substring(0, 50) + '...' : `@${payload.handle} on ${payload.platform}`;
      saveToHistory(historyText, data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (text, data) => {
    const pType = (data.type === 'github_evaluation' || data.type === 'tech_evaluation') ? data.skill_level : data.personality_type;
    const newHistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      text: text,
      personality: pType,
      data: data
    };
    const updatedHistory = [newHistoryItem, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('personality_history', JSON.stringify(updatedHistory));
  }

  const getChartData = () => {
    if (!results || results.type === 'github_evaluation' || results.type === 'tech_evaluation') return [];
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
    setAnswers(['', '', '', '', '']);
    setMockSocialData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
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
        <section className="input-section glass-card" style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column' }}>
          
          <div className="tabs" style={{ display: 'flex', marginBottom: '1.5rem', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '12px' }}>
            <button 
              className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
               Q&A Assessment
            </button>
            <button 
              className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
               Social & Tech Profiles
            </button>
          </div>

          {activeTab === 'qa' ? (
            <>
              <h2>Discover Your Personality</h2>
              <p>Answer the following questions thoughtfully to analyze your Big Five personality traits.</p>
              <div className="questions-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem', marginTop: '1rem' }}>
                {questions.map((question, index) => (
                  <div key={index} className="question-box">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {index + 1}. {question}
                    </label>
                    <textarea 
                      placeholder="Type your answer here..."
                      value={answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      style={{ height: '100px' }}
                    ></textarea>
                  </div>
                ))}
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}
              <button 
                className="btn-primary" 
                onClick={analyzeText} 
                disabled={loading || answers.every(a => a.trim().length === 0)}
                style={{ marginTop: 'auto' }}
              >
                {loading ? <div className="spinner"></div> : <><Send size={20} /> Analyze Answers</>}
              </button>
            </>
          ) : (
            <>
              <h2>Profile Analysis</h2>
              <p>Evaluate your profile footprint, technical skills, and connections.</p>
              


              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Platform</label>
                  <select 
                    value={socialPlatform} 
                    onChange={(e) => {
                        setSocialPlatform(e.target.value);
                        setMockSocialData(null);
                        setError('');
                    }}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="GitHub">GitHub (Open API)</option>
                    <option value="LeetCode">LeetCode (Open API)</option>
                    <option value="Codeforces">Codeforces (Open API)</option>
                    <option value="HackerRank">HackerRank (Open API)</option>
                  </select>
                </div>
                
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Account Handle</label>
                      <div style={{ display: 'flex', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>@</span>
                        <input 
                          type="text" 
                          placeholder="username" 
                          value={socialHandle}
                          onChange={(e) => setSocialHandle(e.target.value)}
                          style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>

                    <button 
                      className="btn-secondary" 
                      onClick={fetchRealSocialData}
                      disabled={fetchingSocial || !socialHandle.trim()}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', marginTop: '0.5rem' }}
                    >
                      {fetchingSocial ? <div className="spinner" style={{width: '20px', height: '20px', borderTopColor: 'var(--text-primary)'}}></div> : <><Database size={18} /> Fetch Profile Data</>}
                    </button>
              </div>

              {mockSocialData && (
                <div className="mock-data-card" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--accent-primary)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                    <User size={18} /> Scraped Data Summary
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {socialPlatform === 'GitHub' && (
                      <>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                          <Users size={20} style={{ margin: '0 auto 0.25rem', color: 'var(--text-secondary)' }} />
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{mockSocialData.friend_count}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Followers</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{mockSocialData.public_repos}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Repositories</div>
                        </div>
                      </>
                    )}
                    {socialPlatform === 'LeetCode' && (
                      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{mockSocialData.total_solved}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Solved</div>
                      </div>
                    )}
                    {socialPlatform === 'Codeforces' && (
                      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{mockSocialData.rating}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating</div>
                      </div>
                    )}
                    {socialPlatform === 'HackerRank' && (
                      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{mockSocialData.badges}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Badges</div>
                      </div>
                    )}
                  </div>
                  
                  {mockSocialData.posts && mockSocialData.posts.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Content Extracted: {mockSocialData.posts.length} items</div>
                      {mockSocialData.posts.slice(0,3).map((post, i) => (
                        <div key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{post}"</div>
                      ))}
                      {mockSocialData.posts.length > 3 && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>+ {mockSocialData.posts.length - 3} more</div>}
                    </div>
                  )}
                </div>
              )}

              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem' }}>{error}</div>}
              
              <button 
                className="btn-primary" 
                onClick={analyzeSocial} 
                disabled={loading || !mockSocialData}
                style={{ marginTop: 'auto', paddingTop: '1rem' }}
              >
                {loading ? <div className="spinner"></div> : <><Search size={20} /> Analyze Profile</>}
              </button>
            </>
          )}
        </section>

        {/* Right Column: Results */}
        <section className="results-section glass-card">
          {!results ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', opacity: 0.5 }}>
              <Activity size={48} style={{ marginBottom: '1rem' }} />
              <p>Your analysis results will appear here</p>
            </div>
          ) : results.type === 'tech_evaluation' || results.type === 'github_evaluation' ? (
            <>
              {/* Developer Assessment Dashboard */}
              <div className="personality-header">
                <h3>Developer Assessment</h3>
                <div className="personality-type">{results.skill_level}</div>
                <div className="confidence pulse-glow" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Technical Score: {results.developer_score}/100</div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {Object.entries(results.metrics).map(([key, val], i) => (
                  <div key={i} className="hover-scale" style={{ flex: '1 1 30%', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{val}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{key}</div>
                  </div>
                ))}
              </div>

              <div className="traits-grid animate-slide-up delay-100">
                <div className="trait-box strengths hover-scale">
                  <h4>Key Strengths</h4>
                  <ul>
                    {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="trait-box weaknesses hover-scale">
                  <h4>Areas for Improvement</h4>
                  <ul>
                    {results.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              {results.suggestions && results.suggestions.length > 0 && (
                <div className="hover-scale animate-slide-up delay-200" style={{ marginTop: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Actionable Next Steps</h4>
                  <ul style={{ paddingLeft: '1.5rem', margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {results.suggestions.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                  </ul>
                </div>
              )}

              {results.top_languages && results.top_languages.length > 0 && (
                <div className="careers animate-slide-up delay-300" style={{ marginTop: '1.5rem' }}>
                  <h4>Top Languages</h4>
                  <div className="career-tags">
                    {results.top_languages.map(([lang, pct], i) => (
                      <span key={i} className="tag">{lang} ({pct}%)</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Standard Personality Radar Dashboard */}
              <div className="personality-header">
                <h3>You are an</h3>
                <div className="personality-type">{results.personality_type}</div>
                <div className="confidence pulse-glow" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>AI Confidence Score: {results.confidence_score}%</div>
              </div>

              <div className="chart-container animate-fade-in">
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

              <div className="traits-grid animate-slide-up delay-100">
                <div className="trait-box strengths hover-scale">
                  <h4>Key Strengths</h4>
                  <ul>
                    {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="trait-box weaknesses hover-scale">
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
