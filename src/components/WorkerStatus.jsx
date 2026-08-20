import React from 'react';
import { Hash, Activity, Cpu, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

const STATE_CONFIG = {
  idle:      { color: 'var(--text-muted)',       icon: <RotateCcw size={16} />,     label: 'Idle / Ready',   ring: false },
  computing: { color: '#38bdf8',                 icon: <Activity size={16} />,      label: 'Computing…',     ring: true  },
  completed: { color: 'var(--status-connected)', icon: <CheckCircle2 size={16} />,  label: 'Task Complete',  ring: false },
  cancelled: { color: '#f59e0b',                 icon: <XCircle size={16} />,       label: 'Cancelled',      ring: false },
  error:     { color: '#f87171',                 icon: <AlertTriangle size={16} />, label: 'Error',          ring: false },
};

const WorkerStatus = ({ workerId, connectionStatus, workerState = 'idle', tasksCompleted = 0 }) => {
  const isConnected = connectionStatus === 'connected';
  const stateConf   = STATE_CONFIG[workerState] || STATE_CONFIG.idle;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.78rem', fontWeight: 700 }}>
        <Activity size={16} color="var(--accent-primary)" />
        Worker Node Status
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Worker ID */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Worker ID</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hash size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>
              {workerId || 'Pending…'}
            </span>
          </div>
        </div>

        {/* Compute State — with animated ring when computing */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Compute State</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Animated status dot */}
            <div style={{ position: 'relative', width: '12px', height: '12px', flexShrink: 0 }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                backgroundColor: stateConf.color,
                boxShadow: stateConf.ring ? `0 0 8px ${stateConf.color}` : 'none'
              }} />
              {stateConf.ring && (
                <div style={{
                  position: 'absolute', inset: '-4px',
                  borderRadius: '50%',
                  border: `2px solid ${stateConf.color}`,
                  opacity: 0.5,
                  animation: 'computeRing 1.4s ease-out infinite'
                }} />
              )}
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: stateConf.color, transition: 'color 0.3s ease' }}>
              {stateConf.label}
            </span>
          </div>
        </div>

        {/* Java WebSocket */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Java Master Link</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: isConnected ? 'var(--status-connected)' : 'var(--text-muted)',
              boxShadow: isConnected ? '0 0 10px var(--status-connected)' : 'none',
              animation: isConnected ? 'pulse-glow 2s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isConnected ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Thread Count */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Background Threads</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)' }}>
              1 Web Worker
            </span>
          </div>
        </div>

        {/* Tasks Completed */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tasks Completed</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color={tasksCompleted > 0 ? 'var(--status-connected)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: tasksCompleted > 0 ? 'var(--status-connected)' : 'var(--text-muted)' }}>
              {tasksCompleted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerStatus;
