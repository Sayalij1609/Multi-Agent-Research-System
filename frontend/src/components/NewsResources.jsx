import React, { useState, useMemo } from 'react';

/**
 * Parses DuckDuckGo raw output text from SearchAgent into structured objects:
 * Title : ...
 * URL : ...
 * Snippet : ...
 */
function parseSearchResults(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const items = [];
  const blocks = rawText.split(/-----------------------------|\n\s*\n(?=Title\s*:)/i);

  for (const block of blocks) {
    const titleMatch = block.match(/Title\s*:\s*(.+)/i);
    const urlMatch = block.match(/URL\s*:\s*(https?:\/\/[^\s]+)/i);
    const snippetMatch = block.match(/Snippet\s*:\s*([\s\S]+)/i);

    if (urlMatch) {
      const url = urlMatch[1].trim();
      const title = titleMatch ? titleMatch[1].trim() : 'Web Source';
      let snippet = snippetMatch ? snippetMatch[1].trim() : '';

      // Clean snippet if it contains next block titles
      snippet = snippet.split('\nTitle :')[0].trim();

      let domain = '';
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch {
        domain = 'web';
      }

      items.push({ title, url, snippet, domain });
    }
  }

  return items;
}

export default function NewsResources({ rawText }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(null);

  const resources = useMemo(() => parseSearchResults(rawText), [rawText]);

  const filteredResources = useMemo(() => {
    if (!filterQuery.trim()) return resources;
    const q = filterQuery.toLowerCase();
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q) ||
        r.snippet.toLowerCase().includes(q)
    );
  }, [resources, filterQuery]);

  if (!rawText || resources.length === 0) return null;

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <div className="resources-title-group">
          <span className="resources-icon">🌐</span>
          <div>
            <h3>Related News & Web Sources</h3>
            <span className="resources-count">
              {resources.length} verified web sources discovered by Search Agent
            </span>
          </div>
        </div>

        {resources.length > 2 && (
          <div className="resources-search-box">
            <span className="r-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Filter sources..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="resources-grid">
        {filteredResources.map((res, idx) => (
          <div className="resource-card" key={res.url + idx}>
            <div className="resource-card-top">
              <span className="domain-badge">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${res.domain}&sz=32`}
                  alt=""
                  className="domain-favicon"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {res.domain}
              </span>

              <button
                className="copy-url-btn"
                onClick={() => handleCopy(res.url)}
                title="Copy link"
              >
                {copiedUrl === res.url ? '✓ Copied' : '🔗 Copy'}
              </button>
            </div>

            <h4 className="resource-title">
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                title={res.title}
              >
                {res.title}
              </a>
            </h4>

            {res.snippet && (
              <p className="resource-snippet">{res.snippet}</p>
            )}

            <div className="resource-card-footer">
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-link-btn"
              >
                Visit Source ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
