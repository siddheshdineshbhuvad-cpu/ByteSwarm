import React from 'react';
import { Cpu, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

const WorkerNode = ({
  id = 'WORKER-001',
  status = 'IDLE', // 'IDLE' | 'COMPUTING' | 'COMPLETED' | 'DISCONNECTED'
  progress = 0,
  chunkId = null,
  algorithm = null,
  browserInfo = 'Chrome (HTML5)',
  isLocal = false
}) => {
  const isComputing = status === 'COMPUTING';
  const isCompleted = status === 'COMPLETED';
  const isDisconnected = status === 'DISCONNECTED';
  const isIdle = status === 'IDLE' || status === 'CONNECTED';

  // Status visual colors
  const getStatusColor = () => {
    if (isComputing) return '#38bdf8';
    if (isCompleted) return '#34d399';
    if (isDisconnected) return '#f87171';
    return '#94a3b8';
  };

  const statusColor = getStatusColor();

  return (
    <div
      className={`glass-panel ${isComputing ? 'worker-computing' : ''}`}
      style={{
        width: '210px',
        padding: '1rem',
        borderRadius: '14px',
        background: isComputing
          ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(15, 23, 42, 0.95))'
          : isCompleted
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95))'
          : isDisconnected
          ? 'rgba(30, 41, 59, 0.5)'
          : 'rgba(30, 41, 59, 0.75)',
        border: `1.5px solid ${isComputing ? '#38bdf8' : isCompleted ? 'rgba(16, 185, 129, 0.4)' : isDisconnected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        transition: 'all 0.3s ease',
        zIndex: 5,
        position: 'relative'
      }}
    >
      {/* Worker Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              background: isComputing ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={16} color={statusColor} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc' }}>
              {id}
            </h4>
            {isLocal && (
              <span style={{ fontSize: '0.6rem', color: '#a78bfa', fontWeight: 600, display: 'block' }}>
                (This Browser)
              </span>
            )}
          </div>
        </div>

        {/* State Badge */}
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '0.15rem 0.55rem',
            borderRadius: '12px',
            background: isComputing
              ? 'rgba(56, 189, 248, 0.2)'
              : isCompleted
              ? 'rgba(16, 185, 129, 0.2)'
              : isDisconnected
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(255, 255, 255, 0.1)',
            color: statusColor,
            border: `1px solid ${statusColor}44`,
            letterSpacing: '0.03em'
          }}
        >
          {status}
        </span>
      </div>

      {/* Details section */}
      <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {chunkId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Chunk ID:</span>
            <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>#{chunkId}</strong>
          </div>
        )}

        {algorithm && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Task:</span>
            <strong style={{ color: '#e2e8f0', fontSize: '0.7rem' }}>{algorithm}</strong>
          </div>
        )}

        {/* Progress Bar (Visible when computing or completed) */}
        {(isComputing || isCompleted) && (
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span>Progress</span>
              <span style={{ color: statusColor, fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: isCompleted ? '#10b981' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  borderRadius: '3px',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
          </div>
        )}

        {!chunkId && isIdle && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.25rem 0' }}>
            Ready for task assignment
          </div>
        )}

        {isDisconnected && (
          <div style={{ fontSize: '0.7rem', color: '#f87171', fontStyle: 'italic', textAlign: 'center', padding: '0.25rem 0' }}>
            Node Disconnected
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerNode;
