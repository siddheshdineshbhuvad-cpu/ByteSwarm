import React, { useState } from 'react';
import { CheckCircle2, Clock, Cpu, Copy, Check, Send, WifiOff, RefreshCw } from 'lucide-react';

const ResultCard = ({ resultData, workerId, emitStatus = null, onReEmit = null }) => {
  const [copied, setCopied] = useState(false);

  if (!resultData) {
    return (
      <div className="glass-panel" style={{
        padding: '1.5rem', borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Computation Result</h3>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
          No computation results yet. Execute a math task to process data in the background worker.
        </p>
      </div>
    );
  }

  const { taskId, algorithm, algorithmLabel, durationMs, result, timestamp } = resultData;

  const javaEmitPayload = {
    type:           'TASK_RESULT',
    workerId:       workerId || 'WKR-LOCAL',
    taskId:         taskId   || 'TASK-UNKN',
    algorithm:      algorithm || 'UNKNOWN',
    status:         'SUCCESS',
    executionTimeMs: durationMs,
    result:         result,
    timestamp:      timestamp || Date.now()
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(javaEmitPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emitSent    = emitStatus === 'sent';
  const emitOffline = emitStatus === 'offline';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        borderRadius: '14px',
        border: '1px solid rgba(16,185,129,0.3)',
        boxShadow: '0 4px 24px rgba(16,185,129,0.08)',
        animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both'
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} color="var(--status-connected)" />
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Computation Complete</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem', fontFamily: 'monospace',
            background: 'rgba(16,185,129,0.15)', color: 'var(--status-connected)',
            padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600
          }}>
            {taskId}
          </span>
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(59,130,246,0.15)', color: '#93c5fd',
            padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 500
          }}>
            {algorithmLabel || algorithm}
          </span>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {/* Execution Time */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Execution Time</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'monospace', color: '#60a5fa' }}>
            <Clock size={16} />
            {durationMs.toLocaleString()} ms
          </div>
        </div>

        {/* Processed By */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Processed By</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-main)' }}>
            <Cpu size={16} color="var(--accent-primary)" />
            {workerId || 'Worker Thread'}
          </div>
        </div>

        {/* Java Protocol Status — reflects actual WS state */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Java Protocol</p>
          {emitSent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--status-connected)' }}>
              <Send size={14} />
              Emitted to Java Master
            </div>
          ) : emitOffline ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                <WifiOff size={14} />
                Simulated (Offline)
              </div>
              {onReEmit && (
                <button
                  onClick={onReEmit}
                  style={{
                    background: 'rgba(59,130,246,0.15)', color: '#93c5fd',
                    border: '1px solid rgba(59,130,246,0.3)', borderRadius: '5px',
                    padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <RefreshCw size={11} />
                  Re-emit when online
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</div>
          )}
        </div>
      </div>

      {/* ── Output Summary ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
          Computed Output Summary
        </p>
        <div style={{
          background: 'rgba(15,23,42,0.8)', padding: '0.75rem 1rem', borderRadius: '8px',
          fontSize: '0.875rem', fontFamily: 'monospace',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {typeof result === 'object' && result !== null ? (
            Object.entries(result).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0', gap: '1rem' }}>
                <span style={{ color: '#94a3b8' }}>{key}:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600, textAlign: 'right' }}>{String(val)}</span>
              </div>
            ))
          ) : (
            <span style={{ color: '#38bdf8' }}>{String(result)}</span>
          )}
        </div>
      </div>

      {/* ── Java Payload JSON ────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Java Master Node WebSocket Payload
          </span>
          <button
            id="btn-copy-payload"
            onClick={handleCopy}
            style={{
              background: 'transparent', border: 'none',
              color: copied ? 'var(--status-connected)' : 'var(--accent-primary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.75rem', transition: 'color 0.2s ease'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
        <pre style={{
          background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '8px',
          fontSize: '0.75rem', color: '#a7f3d0', overflowX: 'auto', margin: 0,
          border: '1px solid rgba(255,255,255,0.04)',
          lineHeight: 1.6
        }}>
          {JSON.stringify(javaEmitPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ResultCard;
