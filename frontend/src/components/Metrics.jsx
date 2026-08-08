export default function Metrics({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="metrics-bar">
      <div className="metric-tile">
        <div className="metric-icon">🌐</div>
        <div>
          <div className="metric-val">{metrics.sources}</div>
          <div className="metric-key">Verified Sources</div>
        </div>
      </div>

      <div className="metric-divider" />

      <div className="metric-tile">
        <div className="metric-icon">📝</div>
        <div>
          <div className="metric-val">{metrics.words}</div>
          <div className="metric-key">Report Words</div>
        </div>
      </div>

      <div className="metric-divider" />

      <div className="metric-tile">
        <div className="metric-icon">⏱️</div>
        <div>
          <div className="metric-val">{metrics.duration}</div>
          <div className="metric-key">Elapsed Time</div>
        </div>
      </div>

      <div className="metric-divider" />

      <div className="metric-tile">
        <div className="metric-icon">⭐</div>
        <div>
          <div className="metric-val">{metrics.score}</div>
          <div className="metric-key">Critic QA Score</div>
        </div>
      </div>
    </div>
  );
}
