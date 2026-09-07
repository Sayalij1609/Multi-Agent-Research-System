/**
 * API helper — fetch wrappers for the SYNAPSE backend.
 * Supports VITE_API_BASE_URL for cross-origin backend deployments (e.g. Render).
 * In local dev without env var, relative paths are proxied by Vite.
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

export async function fetchHistoryEntry(id) {
  const res = await fetch(`${API_BASE}/history/${id}`);
  if (!res.ok) throw new Error('Entry not found');
  return res.json();
}

export async function deleteHistoryEntry(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function downloadPdf(report, topic) {
  const res = await fetch(`${API_BASE}/download-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, topic: topic || 'Research Report' }),
  });
  if (!res.ok) throw new Error('PDF download failed');
  return res.blob();
}

export async function downloadDocx(report, topic) {
  const res = await fetch(`${API_BASE}/download-docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, topic: topic || 'Research Report' }),
  });
  if (!res.ok) throw new Error('Word (.docx) download failed');
  return res.blob();
}


