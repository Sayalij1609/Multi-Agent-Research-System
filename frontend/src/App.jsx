import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import Topbar from './components/Topbar';
import Home from './components/Home';
import Hero from './components/Hero';
import Pipeline from './components/Pipeline';
import Metrics from './components/Metrics';
import Results from './components/Results';
import Footer from './components/Footer';
import HistoryModal from './components/HistoryModal';

import useResearch from './hooks/useResearch';
import { fetchHistoryEntry } from './api';

const AGENTS = ['search', 'reader', 'writer', 'critic'];

export default function App() {
  /* ── View State: 'home' | 'dashboard' ── */
  const [currentView, setCurrentView] = useState('home');

  /* ── Lock to Light Theme ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('syn-t', 'light');
  }, []);

  /* ── History Modal ── */
  const [historyOpen, setHistoryOpen] = useState(false);
  const openHistory = () => setHistoryOpen(true);
  const closeHistory = () => setHistoryOpen(false);

  /* ── Research pipeline ── */
  const { start, reset, agentStatuses, results, metrics, isRunning, error } =
    useResearch();

  const [currentTopic, setCurrentTopic] = useState('');
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Refresh history on completion
  const prevMetrics = useRef(null);
  useEffect(() => {
    if (metrics && metrics !== prevMetrics.current) {
      prevMetrics.current = metrics;
      setRefreshSignal((s) => s + 1);
    }
  }, [metrics]);

  const handleStartResearch = useCallback(
    (topic) => {
      setCurrentView('dashboard');
      setCurrentTopic(topic);
      start(topic);
    },
    [start]
  );

  const handleSwitchView = useCallback(
    (viewName) => {
      setCurrentView(viewName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  /* ── Load a history entry ── */
  const [historyResults, setHistoryResults] = useState(null);
  const [historyStatuses, setHistoryStatuses] = useState(null);
  const [historyMetrics, setHistoryMetrics] = useState(null);

  const handleSelectEntry = useCallback(
    async (id) => {
      try {
        const h = await fetchHistoryEntry(id);
        if (h.error) return;

        reset();
        setCurrentView('dashboard');
        setCurrentTopic(h.topic);

        // Set all agents to done
        setHistoryStatuses(
          Object.fromEntries(AGENTS.map((k) => [k, 'done']))
        );

        // Build results from history
        const r = {};
        if (h.search_results) r.search = h.search_results;
        if (h.scraped_content) r.reader = h.scraped_content;
        if (h.report) r.writer = h.report;
        if (h.feedback) r.critic = h.feedback;
        setHistoryResults(r);

        // Compute metrics from history
        const words = h.report ? h.report.split(/\s+/).filter(Boolean).length : 0;
        const urls = h.report ? (h.report.match(/https?:\/\/[^\s)]+/g) || []) : [];
        let score = '—';
        if (h.feedback) {
          const m = h.feedback.match(/Score:\s*(\d+\/\d+)/i);
          if (m) score = m[1];
        }
        setHistoryMetrics({
          sources: urls.length || '—',
          words: words.toLocaleString(),
          duration: '—',
          score,
        });

        setTimeout(
          () =>
            document
              .getElementById('results-section')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          150
        );
      } catch (err) {
        console.error('Load failed:', err);
      }
    },
    [reset]
  );

  // Clear history overrides when a live research starts
  useEffect(() => {
    if (isRunning) {
      setHistoryResults(null);
      setHistoryStatuses(null);
      setHistoryMetrics(null);
    }
  }, [isRunning]);

  // Merge live + history state
  const displayStatuses = historyStatuses || agentStatuses;
  const displayResults = historyResults || results;
  const displayMetrics = historyMetrics || metrics;

  return (
    <>
      <HistoryModal
        isOpen={historyOpen}
        onClose={closeHistory}
        onSelectEntry={handleSelectEntry}
        refreshSignal={refreshSignal}
      />

      <div className="main full-width-main">
        <Topbar
          currentView={currentView}
          onSwitchView={handleSwitchView}
          onOpenHistory={openHistory}
        />

        <div className="content">
          {currentView === 'home' ? (
            <Home
              onLaunchResearch={(topic) => {
                if (topic) {
                  handleStartResearch(topic);
                } else {
                  handleSwitchView('dashboard');
                }
              }}
            />
          ) : (
            <div className="dashboard-view">
              <Hero
                onStartResearch={handleStartResearch}
                isRunning={isRunning}
              />

              {error && <div className="err">{error}</div>}

              <Pipeline agentStatuses={displayStatuses} />

              <Metrics metrics={displayMetrics} />

              <div id="results-section">
                <Results results={displayResults} topic={currentTopic} />
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
