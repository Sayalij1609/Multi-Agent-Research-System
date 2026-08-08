import { useState } from 'react';

const SUGGESTIONS = [
  'Autonomous AI Agents 2025',
  'CRISPR Gene Editing Breakthroughs',
  'Nuclear Fusion Net Energy Gains',
  'Quantum Error Correction Milestones',
  'AI in Diagnostic Healthcare',
];

export default function Hero({ onStartResearch, isRunning }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  const handleRun = () => {
    const q = query.trim();
    if (!q) {
      setError('Please enter a research topic.');
      return;
    }
    setError(null);
    onStartResearch(q);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isRunning) handleRun();
  };

  const pickSuggestion = (text) => {
    setQuery(text);
  };

  return (
    <div className="lab-search-panel">
      <div className="lab-search-header">
        <div className="lab-title-group">
          <h2>🔬 Autonomous Research Lab</h2>
          <p>Query live web intelligence, scrape detailed content, and generate executive reports.</p>
        </div>
      </div>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="q"
          className="search-input"
          placeholder="Enter a research topic, market trend, or scientific question..."
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="search-btn"
          id="go"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? 'Synthesizing…' : 'Run Pipeline →'}
        </button>
      </div>

      <div className="suggestions">
        <span className="sug-label">Trending:</span>
        {SUGGESTIONS.map((s) => (
          <span className="sug" key={s} onClick={() => pickSuggestion(s)}>
            {s}
          </span>
        ))}
      </div>

      {error && <div className="err">{error}</div>}
    </div>
  );
}
