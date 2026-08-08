import React from 'react';

export default function Topbar({
  currentView,
  onSwitchView,
  onOpenHistory,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div
          className="topbar-brand-title"
          onClick={() => onSwitchView('home')}
          title="Return to Home Overview"
        >
          <div className="brand-logo-badge">⚡</div>
          <span className="brand-name-text">
            SYNAPSE <span className="brand-accent-tag">AI</span>
          </span>
        </div>

        <div className="nav-divider" />

        <nav className="topbar-nav">
          <button
            className={`topbar-nav-tab${currentView === 'home' ? ' active' : ''}`}
            onClick={() => onSwitchView('home')}
          >
            <span className="nav-tab-icon">🏠</span> Overview
          </button>

          <button
            className={`topbar-nav-tab${currentView === 'dashboard' ? ' active' : ''}`}
            onClick={() => onSwitchView('dashboard')}
          >
            <span className="nav-tab-icon">🔬</span> Research Lab
          </button>

          <button
            className="topbar-nav-tab"
            onClick={onOpenHistory}
          >
            <span className="nav-tab-icon">📜</span> History Archive
          </button>
        </nav>
      </div>

      <div className="topbar-right">
        <div className="status-pill">
          <span className="status-dot" />
          Autonomous Engine · Active
        </div>

        {currentView === 'home' ? (
          <button
            className="topbar-action-btn"
            onClick={() => onSwitchView('dashboard')}
          >
            Launch Lab 🚀
          </button>
        ) : (
          <button
            className="topbar-action-btn secondary-action"
            onClick={onOpenHistory}
          >
            📜 History
          </button>
        )}
      </div>
    </header>
  );
}
