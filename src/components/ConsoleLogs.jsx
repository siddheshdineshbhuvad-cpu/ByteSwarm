import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ArrowDownCircle, Download } from 'lucide-react';

const LOG_FILTERS = ['ALL', 'WORKER', 'JAVA', 'MAIN'];

const SOURCE_STYLES = {
  WORKER: { bg: 'rgba(59,130,246,0.2)',  color: '#60a5fa',  label: '[WORKER]'  },
  JAVA:   { bg: 'rgba(168,85,247,0.2)',  color: '#c084fc',  label: '[JAVA-WS]' },
  SOCKET: { bg: 'rgba(168,85,247,0.2)',  color: '#c084fc',  label: '[JAVA-WS]' },
  MAIN:   { bg: 'rgba(234,179,8,0.2)',   color: '#fde047',  label: '[MAIN-UI]' },
};
const DEFAULT_SOURCE = { bg: 'rgba(255,255,255,0.1)', color: '#94a3b8', label: '[SYS]' };

const LOG_TYPE_BORDER = {
  success: '#10b981',
  error:   '#ef4444',
  warning: '#f59e0b',
  info:    'rgba(255,255,255,0.1)',
};

const LOG_TYPE_COLOR = {
  success: '#34d399',
  error:   '#f87171',
  warning: '#fbbf24',
  info:    '#e2e8f0',
};

const ConsoleLogs = ({ logs = [], onClear }) => {
  const [filter, setFilter]         = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [newestFirst, setNewestFirst] = useState(false);
  const logsEndRef = useRef(null);

  const filteredLogs = logs.filter(log => filter === 'ALL' || log.source === filter);
  const displayLogs  = newestFirst ? [...filteredLogs].reverse() : filteredLogs;

  useEffect(() => {
    if (autoScroll && !newestFirst && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, newestFirst]);

  const handleExport = () => {
    const text = filteredLogs.map(l => `[${l.time}] [${l.source}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `byteswarm-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem', borderRadius: '14px',
        display: 'flex', flexDirection: 'column',
        minHeight: '280px', maxHeight: '420px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>Web Worker &amp; Grid Console Logs</h3>
          <span style={{
            fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)',
            padding: '0.15rem 0.4rem', borderRadius: '10px', color: 'var(--text-muted)'
          }}>
            {filteredLogs.length} events
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.2rem', background: 'rgba(0,0,0,0.3)', padding: '0.15rem', borderRadius: '6px' }}>
            {LOG_FILTERS.map(f => (
              <button
                key={f}
                id={`log-filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'var(--accent-primary)' : 'transparent',
                  color: filter === f ? '#fff' : 'var(--text-muted)',
                  border: 'none', borderRadius: '4px',
                  padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Newest First toggle */}
          <button
            id="log-sort-toggle"
            onClick={() => setNewestFirst(v => !v)}
            title={newestFirst ? 'Oldest first' : 'Newest first'}
            style={{
              background: newestFirst ? 'rgba(168,85,247,0.2)' : 'transparent',
              color: newestFirst ? '#c084fc' : 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '0.3rem 0.5rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              fontSize: '0.65rem', fontWeight: 600, gap: '0.25rem',
              transition: 'all 0.15s ease'
            }}
          >
            {newestFirst ? '↑ Newest' : '↓ Oldest'}
          </button>

          {/* Auto-scroll toggle */}
          <button
            id="log-autoscroll-toggle"
            onClick={() => setAutoScroll(v => !v)}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            style={{
              background: autoScroll ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: autoScroll ? '#60a5fa' : 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '0.3rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowDownCircle size={14} />
          </button>

          {/* Export button */}
          <button
            id="log-export"
            onClick={handleExport}
            title="Export logs as .txt"
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
              padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={14} />
          </button>

          {/* Clear button */}
          {onClear && (
            <button
              id="log-clear"
              onClick={onClear}
              title="Clear Logs"
              style={{
                background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Log Output ───────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(0,0,0,0.45)', borderRadius: '8px',
        padding: '0.75rem', flex: 1, overflowY: 'auto',
        fontFamily: 'monospace', fontSize: '0.8rem',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        {displayLogs.length === 0 ? (
          <div style={{ opacity: 0.4, fontStyle: 'italic', padding: '0.5rem' }}>
            No logs for filter [{filter}]. Web worker events will appear here…
          </div>
        ) : (
          displayLogs.map((log, index) => {
            const badge     = SOURCE_STYLES[log.source] || DEFAULT_SOURCE;
            const typeColor  = LOG_TYPE_COLOR[log.type] || LOG_TYPE_COLOR.info;
            const leftBorder = LOG_TYPE_BORDER[log.type] || LOG_TYPE_BORDER.info;
            return (
              <div
                key={log.id || index}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  padding: '0.22rem 0.4rem',
                  marginBottom: '1px',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${leftBorder}`,
                  background: log.type === 'error' ? 'rgba(239,68,68,0.05)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Timestamp */}
                <span style={{ color: '#475569', fontSize: '0.72rem', minWidth: '72px', flexShrink: 0 }}>
                  [{log.time}]
                </span>

                {/* Source Tag */}
                <span style={{
                  background: badge.bg, color: badge.color,
                  fontSize: '0.65rem', fontWeight: 700,
                  padding: '0.1rem 0.35rem', borderRadius: '4px',
                  minWidth: '66px', textAlign: 'center', flexShrink: 0
                }}>
                  {badge.label}
                </span>

                {/* Message */}
                <span style={{ color: typeColor, wordBreak: 'break-word', flex: 1 }}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default ConsoleLogs;
