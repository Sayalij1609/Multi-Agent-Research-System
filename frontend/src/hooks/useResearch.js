import { useState, useRef, useCallback } from 'react';

const AGENTS = ['search', 'reader', 'writer', 'critic'];

/**
 * Custom hook that manages the entire SSE research flow.
 *
 * Returns:
 *   start(topic)  — kick off a research pipeline
 *   reset()       — clear all state
 *   agentStatuses — { search: 'idle'|'running'|'done', ... }
 *   results       — { search, reader, writer, critic }
 *   metrics       — { sources, words, duration, score }
 *   isRunning     — boolean
 *   error         — string | null
 */
export default function useResearch() {
  const [agentStatuses, setAgentStatuses] = useState(
    () => Object.fromEntries(AGENTS.map(k => [k, 'idle']))
  );
  const [results, setResults] = useState({});
  const [metrics, setMetrics] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const esRef = useRef(null);
  const t0Ref = useRef(null);

  const reset = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setAgentStatuses(Object.fromEntries(AGENTS.map(k => [k, 'idle'])));
    setResults({});
    setMetrics(null);
    setIsRunning(false);
    setError(null);
    t0Ref.current = null;
  }, []);

  const computeMetrics = useCallback((report, feedback) => {
    const words = report ? report.split(/\s+/).filter(Boolean).length : 0;
    const urls = report ? (report.match(/https?:\/\/[^\s)]+/g) || []) : [];
    const duration = t0Ref.current
      ? ((Date.now() - t0Ref.current) / 1000).toFixed(1) + 's'
      : '—';
    let score = '—';
    if (feedback) {
      const m = feedback.match(/Score:\s*(\d+\/\d+)/i);
      if (m) score = m[1];
    }
    return {
      sources: urls.length || '—',
      words: words.toLocaleString(),
      duration,
      score,
    };
  }, []);

  const start = useCallback((topic) => {
    reset();
    setIsRunning(true);
    t0Ref.current = Date.now();

    let report = '';
    let feedback = '';

    const es = new EventSource(`/run?topic=${encodeURIComponent(topic)}`);
    esRef.current = es;

    es.onmessage = (e) => {
      let d;
      try { d = JSON.parse(e.data); } catch { return; }

      if (d.error) {
        setError(d.error);
        es.close();
        setIsRunning(false);
        return;
      }

      if (d.step === 'complete') {
        es.close();
        setMetrics(computeMetrics(report, feedback));
        setIsRunning(false);
        return;
      }

      // Update agent status
      setAgentStatuses(prev => ({ ...prev, [d.step]: d.status }));

      // Collect results
      if (d.status === 'done' && d.result) {
        setResults(prev => ({ ...prev, [d.step]: d.result }));
        if (d.step === 'writer') report = d.result;
        if (d.step === 'critic') feedback = d.result;
      }
    };

    es.onerror = () => {
      es.close();
      setError('Connection lost. Please try again.');
      setIsRunning(false);
    };
  }, [reset, computeMetrics]);

  return { start, reset, agentStatuses, results, metrics, isRunning, error };
}
