import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchHistory, deleteHistoryEntry } from '../api';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export default function HistoryModal({ isOpen, onClose, onSelectEntry, refreshSignal }) {
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
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory, refreshSignal]);

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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">📜</span>
            <h3>Research History Archive</h3>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-search-bar">
          <span className="m-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search past research queries..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        <div className="modal-history-list">
          {filteredHistory.length === 0 ? (
            <div className="modal-empty-state">
              {filterQuery ? 'No matching research queries found.' : 'No research history archived yet.'}
            </div>
          ) : (
            filteredHistory.map((h) => (
              <div
                className="modal-history-card"
                key={h.id}
                onClick={() => {
                  onSelectEntry(h.id);
                  onClose();
                }}
              >
                <div className="m-card-left">
                  <div className="m-card-title">{h.topic}</div>
                  <div className="m-card-meta">
                    <span className="m-tag">Report Archived</span>
                    <span>{timeAgo(h.timestamp)}</span>
                  </div>
                </div>

                <button
                  className="m-del-btn"
                  onClick={(e) => handleDelete(e, h.id)}
                  title="Delete from history"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <span className="m-count">{history.length} Saved Entries</span>
          <button className="m-close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
