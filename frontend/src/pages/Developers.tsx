import React, { useState } from 'react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/songs',
    badge: 'Pagination',
    badgeColor: '#00e5ff',
    accent: '#00e5ff',
    description: 'Fetches a paginated list of popular tracks from the synced cache or live NCS scraper.',
    curl: 'curl http://localhost:3001/api/songs?page=0',
    params: [
      { name: 'page', type: 'integer', optional: true, desc: 'Page index, zero-based (default: 0).' },
    ],
    response: `[
  {
    "id": "dc4a82fe-...",
    "name": "BE THERE WITH U",
    "genre": "House",
    "artists": [{ "name": "2frers" }],
    "coverUrl": "https://ncsmusic.s3...",
    "previewUrl": "https://ncsmusic.s3...",
    "tags": [{ "name": "exciting" }],
    "download": { "regular": "https://ncs.io/track/download/..." }
  }
]`,
  },
  {
    method: 'GET',
    path: '/api/search',
    badge: 'Filter & Search',
    badgeColor: '#00e5ff',
    accent: '#00e5ff',
    description: 'Full-library search with keyword, genre, and mood filters. Queries the entire synced dataset, not just the fetched page.',
    curl: 'curl "http://localhost:3001/api/search?q=party&genre=House&page=0"',
    params: [
      { name: 'q', type: 'string', optional: true, desc: 'Keyword to search in track and artist names.' },
      { name: 'genre', type: 'string', optional: true, desc: 'Exact genre string e.g. DrumBass, House, FutureBass.' },
      { name: 'mood', type: 'string', optional: true, desc: 'Mood tag e.g. Happy, Dark, Energetic.' },
      { name: 'page', type: 'integer', optional: true, desc: 'Page index (default: 0).' },
    ],
    response: `// Same shape as /api/songs`,
  },
  {
    method: 'GET',
    path: '/api/sync',
    badge: 'Background Task',
    badgeColor: '#b500ff',
    accent: '#b500ff',
    description: 'Triggers the background scraper to refresh the local synced_data.json. This is a long-running task. Returns immediately with a status message.',
    curl: 'curl http://localhost:3001/api/sync',
    params: [],
    response: `{ "message": "Sync started in background." }`,
  },
  {
    method: 'GET',
    path: '/api/synced-data.json',
    badge: 'Static File',
    badgeColor: '#b500ff',
    accent: '#b500ff',
    description: 'Downloads the entire synced library as a raw JSON file. Ideal for ML pipelines, data processing, or offline integrations.',
    curl: 'curl -O http://localhost:3001/api/synced-data.json',
    params: [],
    response: `// Array of all synced Song objects`,
  },
  {
    method: 'GET',
    path: '/api/download.mp3',
    badge: 'Proxy Download',
    badgeColor: '#f59e0b',
    accent: '#f59e0b',
    description: 'Proxies a track download from the NCS CDN, automatically appending the .mp3 extension. Use this to provide clean download links from your own domain.',
    curl: 'curl "http://localhost:3001/api/download.mp3?url=https%3A%2F%2Fncs.io%2Ftrack%2Fdownload%2F...&filename=trackname"',
    params: [
      { name: 'url', type: 'string', optional: false, desc: 'URL-encoded NCS download URL.' },
      { name: 'filename', type: 'string', optional: true, desc: 'Output filename (without extension).' },
    ],
    response: `// Binary MP3 file stream`,
  },
];

type Endpoint = typeof ENDPOINTS[number];

const EndpointCard = ({ ep }: { ep: Endpoint }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(ep.curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: '#151518',
        borderRadius: '12px',
        borderLeft: `4px solid ${ep.accent}`,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ background: ep.accent + '22', color: ep.accent, border: `1px solid ${ep.accent}55`, padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>
              {ep.method}
            </span>
            <code style={{ color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>{ep.path}</code>
            <span style={{ background: '#0a0a0c', color: ep.badgeColor, border: `1px solid ${ep.badgeColor}33`, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
              {ep.badge}
            </span>
          </div>
          <span style={{ color: '#555', fontSize: '20px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
        <p style={{ color: '#8a8a93', marginTop: '8px', fontSize: '14px', lineHeight: '1.6' }}>{ep.description}</p>
      </button>

      {/* Expandable body */}
      {open && (
        <div style={{ padding: '0 24px 24px' }}>
          {/* cURL example */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>cURL Example</span>
              <button onClick={copy} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: copied ? '#00e5ff' : '#888', fontSize: '12px', padding: '3px 10px', cursor: 'pointer', transition: 'color 0.2s' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ background: '#0a0a0c', borderRadius: '8px', padding: '14px 16px', overflowX: 'auto' }}>
              <code style={{ color: '#f472b6', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{ep.curl}</code>
            </div>
          </div>

          {/* Query params */}
          {ep.params.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '10px' }}>Query Parameters</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ep.params.map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <code style={{ color: ep.accent, fontFamily: 'monospace', fontSize: '13px', minWidth: '100px', flexShrink: 0 }}>{p.name}</code>
                    <span style={{ background: '#0a0a0c', color: '#888', fontSize: '11px', padding: '1px 7px', borderRadius: '4px', alignSelf: 'center' }}>{p.type}</span>
                    {!p.optional && <span style={{ background: '#ef444422', color: '#ef4444', fontSize: '11px', padding: '1px 7px', borderRadius: '4px', alignSelf: 'center' }}>required</span>}
                    <span style={{ color: '#8a8a93', fontSize: '13px', flex: 1 }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <p style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px' }}>Response Shape</p>
            <div style={{ background: '#0a0a0c', borderRadius: '8px', padding: '14px 16px', overflowX: 'auto' }}>
              <pre style={{ color: '#a78bfa', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>{ep.response}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Developers = () => {
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '80vh', color: '#fff' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'inline-block', background: '#00e5ff18', border: '1px solid #00e5ff33', color: '#00e5ff', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '16px' }}>
            REST API · v1
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 12px 0', lineHeight: 1.1 }}>
            Developer API<br /><span style={{ background: 'linear-gradient(90deg, #00e5ff, #b500ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Guidelines</span>
          </h1>
          <p style={{ color: '#8a8a93', fontSize: '16px', lineHeight: '1.7', maxWidth: '600px' }}>
            Integrate with Bento Music using our REST API. The backend runs on <code style={{ color: '#fff', background: '#0a0a0c', padding: '1px 6px', borderRadius: '4px' }}>localhost:3001</code> and all routes are CORS-proxied automatically in development.
          </p>
        </div>

        {/* Quick Start */}
        <div style={{ background: '#151518', borderRadius: '12px', padding: '24px', marginBottom: '40px', border: '1px solid #222' }}>
          <p style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '14px' }}>Quick Start</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['npm install', 'npm --prefix frontend install', 'npm run dev'].map((cmd, i) => (
              <div key={cmd} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#333', fontSize: '13px', minWidth: '20px' }}>{i + 1}.</span>
                <div style={{ background: '#0a0a0c', borderRadius: '6px', padding: '8px 14px', flex: 1 }}>
                  <code style={{ color: '#f472b6', fontFamily: 'monospace', fontSize: '13px' }}>{cmd}</code>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '14px' }}>
            Backend: <code style={{ color: '#00e5ff' }}>http://localhost:3001</code> &nbsp;·&nbsp; Frontend: <code style={{ color: '#00e5ff' }}>http://localhost:5173</code>
          </p>
        </div>

        {/* Endpoints */}
        <p style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '16px' }}>Endpoints — click to expand</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {ENDPOINTS.map(ep => <EndpointCard key={ep.path} ep={ep} />)}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '48px', padding: '20px', background: '#151518', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '13px' }}>
            Built by <a href="https://github.com/atiqisrak" target="_blank" rel="noreferrer" style={{ color: '#00e5ff', textDecoration: 'none' }}>Atiq Israk</a> · Open source · All music © NCS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Developers;
