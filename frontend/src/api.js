/**
 * API helper — fetch wrappers for the SYNAPSE backend.
 * In dev, Vite proxy forwards /run, /history, /download-pdf to FastAPI.
 */

export async function fetchHistory() {
  const res = await fetch('/history');
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

export async function fetchHistoryEntry(id) {
  const res = await fetch(`/history/${id}`);
  if (!res.ok) throw new Error('Entry not found');
  return res.json();
}

export async function deleteHistoryEntry(id) {
  const res = await fetch(`/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function downloadPdf(report, topic) {
  const res = await fetch('/download-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, topic: topic || 'Research Report' }),
  });
  if (!res.ok) throw new Error('PDF download failed');
  return res.blob();
}

export async function downloadDocx(report, topic) {
  const res = await fetch('/download-docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, topic: topic || 'Research Report' }),
  });
  if (!res.ok) throw new Error('Word (.docx) download failed');
  return res.blob();
}

