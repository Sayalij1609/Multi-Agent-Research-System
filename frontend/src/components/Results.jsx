import { useState } from 'react';
import { marked } from 'marked';
import { downloadPdf, downloadDocx } from '../api';
import NewsResources from './NewsResources';

function ExpandablePanel({ label, agentLabel, content }) {
  const [open, setOpen] = useState(false);

  if (!content) return null;

  return (
    <div className="result-block">
      <button
        className={`expand-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="expand-arrow">▶</span> {label}
      </button>
      <div className={`expand-body${open ? ' open' : ''}`}>
        <div className="raw-panel">
          <div className="raw-label">{agentLabel}</div>
          <div className="raw-text">{content}</div>
        </div>
      </div>
    </div>
  );
}

export default function Results({ results, topic }) {
  const [activeTab, setActiveTab] = useState('report');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const hasAny = results.search || results.reader || results.writer || results.critic;

  if (!hasAny) return null;

  const handleDownloadMarkdown = () => {
    if (!results.writer) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([results.writer], { type: 'text/markdown' })
    );
    a.download = `synapse_${topic ? topic.replace(/\s+/g, '_') : 'report'}.md`;
    a.click();
  };

  const handleDownloadPdf = async () => {
    if (!results.writer) return;
    setPdfLoading(true);
    try {
      const blob = await downloadPdf(results.writer, topic);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `synapse_${topic ? topic.replace(/\s+/g, '_') : 'report'}.pdf`;
      a.click();
    } catch {
      alert('PDF download failed.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!results.writer) return;
    setDocxLoading(true);
    try {
      const blob = await downloadDocx(results.writer, topic);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `synapse_${topic ? topic.replace(/\s+/g, '_') : 'report'}.docx`;
      a.click();
    } catch {
      alert('Word (.docx) download failed.');
    } finally {
      setDocxLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!results.writer) return;
    navigator.clipboard.writeText(results.writer);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="lab-results-hub">
      {/* HUB TAB HEADER */}
      <div className="hub-tab-bar">
        <button
          className={`hub-tab${activeTab === 'report' ? ' active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📝 Executive Report
        </button>

        <button
          className={`hub-tab${activeTab === 'sources' ? ' active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          🌐 Web News & Sources
        </button>

        <button
          className={`hub-tab${activeTab === 'critic' ? ' active' : ''}`}
          onClick={() => setActiveTab('critic')}
        >
          ⭐ Quality Audit Review
        </button>

        <button
          className={`hub-tab${activeTab === 'telemetry' ? ' active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          🛠️ Agent Telemetry
        </button>
      </div>

      {/* TAB PAYLOAD CONTENT */}
      <div className="hub-content-area">
        {/* EXECUTIVE REPORT TAB */}
        {activeTab === 'report' && (
          <div className="report-wrapper">
            {results.writer ? (
              <>
                <div className="report-card">
                  <div className="report-card-header">
                    <div className="card-label purple">📝 Executive Research Document</div>
                    <button
                      className="copy-report-btn"
                      onClick={handleCopyReport}
                      title="Copy report text"
                    >
                      {copySuccess ? '✓ Copied to Clipboard' : '📋 Copy Text'}
                    </button>
                  </div>

                  <div
                    className="md"
                    dangerouslySetInnerHTML={{ __html: marked.parse(results.writer) }}
                  />
                </div>

                {/* EXPORT ACTION SUITE */}
                <div className="export-action-bar">
                  <button
                    className="action-btn docx-btn"
                    onClick={handleDownloadDocx}
                    disabled={docxLoading}
                  >
                    📘 {docxLoading ? 'Generating Word…' : 'Download Word (.docx)'}
                  </button>

                  <button
                    className="action-btn pdf-btn"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                  >
                    📕 {pdfLoading ? 'Generating PDF…' : 'Download PDF (.pdf)'}
                  </button>

                  <button
                    className="action-btn md-btn"
                    onClick={handleDownloadMarkdown}
                  >
                    📝 Download Markdown (.md)
                  </button>
                </div>
              </>
            ) : (
              <div className="tab-pending-state">
                <span className="pending-icon">✍️</span>
                <p>Writer Agent is synthesizing research findings into an executive report...</p>
              </div>
            )}
          </div>
        )}

        {/* WEB NEWS & SOURCES TAB */}
        {activeTab === 'sources' && (
          <div>
            {results.search ? (
              <NewsResources rawText={results.search} />
            ) : (
              <div className="tab-pending-state">
                <span className="pending-icon">🔍</span>
                <p>Search Agent is discovering live web sources...</p>
              </div>
            )}
          </div>
        )}

        {/* CRITIC QUALITY AUDIT TAB */}
        {activeTab === 'critic' && (
          <div>
            {results.critic ? (
              <div className="review-card">
                <div className="card-label green">⭐ Critic Agent Quality Review</div>
                <div
                  className="md"
                  dangerouslySetInnerHTML={{ __html: marked.parse(results.critic) }}
                />
              </div>
            ) : (
              <div className="tab-pending-state">
                <span className="pending-icon">⭐</span>
                <p>Critic Agent will perform quality review once report is complete...</p>
              </div>
            )}
          </div>
        )}

        {/* TELEMETRY LOGS TAB */}
        {activeTab === 'telemetry' && (
          <div className="telemetry-wrapper">
            <ExpandablePanel
              label="Raw Search Agent Output Payload"
              agentLabel="Search Agent Output"
              content={results.search}
            />

            <ExpandablePanel
              label="Raw Reader Agent Scraped Webpage Text"
              agentLabel="Reader Agent Output"
              content={results.reader}
            />
          </div>
        )}
      </div>
    </div>
  );
}
