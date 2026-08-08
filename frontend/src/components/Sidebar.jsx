import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchHistory, deleteHistoryEntry } from '../api';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export default function Sidebar({
  theme,
  onToggleTheme,
  onNewResearch,
  onSelectEntry,
  refreshSignal,
  sidebarOpen,
  onCloseSidebar,
  currentView,
  onSwitchView,
}) {
  const [history, setHistory] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      const items = await fetchHistory();
      setHistory(items);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshSignal]);

  const filteredHistory = useMemo(() => {
    if (!filterQuery.trim()) return history;
    return history.filter((h) =>
      h.topic.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [history, filterQuery]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteHistoryEntry(id);
      loadHistory();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <div>
          <div className="brand-name">SYNAPSE AI</div>
          <div className="brand-tag">Autonomous Research Platform</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Main Navigation</div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item${currentView === 'home' ? ' active' : ''}`}
            onClick={() => {
              onSwitchView('home');
              onCloseSidebar();
            }}
          >
            <span className="nav-icon">🏠</span> System Overview
          </button>

          <button
            className={`nav-item${currentView === 'dashboard' ? ' active' : ''}`}
            onClick={() => {
              onSwitchView('dashboard');
              onNewResearch();
            }}
          >
            <span className="nav-icon">➕</span> New Research Lab
          </button>

          <a
            className="nav-item"
            href="/docs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="nav-icon">📄</span> API Documentation
          </a>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label-between">
          <span>Recent Research ({history.length})</span>
          {history.length > 3 && (
            <input
              type="text"
              className="history-filter-input"
              placeholder="Search..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="history-list" id="history-list">
        {filteredHistory.length === 0 ? (
          <div className="history-empty">
            {filterQuery ? 'No matching queries found.' : 'No research history yet.\nStart your first query in the lab!'}
          </div>
        ) : (
          filteredHistory.map((h) => (
            <div
              className="h-item"
              key={h.id}
              onClick={() => {
                onSelectEntry(h.id);
                onCloseSidebar();
              }}
            >
              <div className="h-dot" />
              <div className="h-info">
                <div className="h-topic">{h.topic}</div>
                <div className="h-time">{timeAgo(h.timestamp)}</div>
              </div>
              <button
                className="h-del"
                onClick={(e) => handleDelete(e, h.id)}
                title="Delete entry"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" onClick={onToggleTheme}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span> Mode
        </button>
        <button className="sidebar-footer-btn" onClick={loadHistory}>
          ↻ Refresh
        </button>
      </div>
    </aside>
  );
}
