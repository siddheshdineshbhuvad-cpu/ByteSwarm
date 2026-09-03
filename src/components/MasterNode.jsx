import React from 'react';
import { Server, Wifi, Cpu, Layers } from 'lucide-react';

const MasterNode = ({ status = 'online', connectedCount = 4, activeJobs = 2, completedJobs = 96, host = 'localhost:8080' }) => {
  const isOnline = status === 'online';

  return (
    <div
      className="glass-panel master-node-glow"
      style={{
        width: '260px',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        border: '2px solid rgba(139, 92, 246, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        zIndex: 5,
        position: 'relative'
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)',
          marginBottom: '0.75rem'
        }}
      >
        <Server size={28} color="#ffffff" />
      </div>

      {/* Header */}
      <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: '#f8fafc' }}>
        MASTER NODE
      </h3>
      <p style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, margin: '0.2rem 0 0.75rem 0' }}>
        Java Netty Master Server
      </p>

      {/* Online Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: isOnline ? '#34d399' : '#f87171',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}
      >
        <Wifi size={13} />
        <span>{isOnline ? 'STATUS: ONLINE' : 'STATUS: OFFLINE'}</span>
      </div>

      {/* Metrics breakdown */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          fontSize: '0.75rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.6rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total TFLOPS</span>
          <strong style={{ color: '#a78bfa', fontSize: '0.9rem' }}>12.8 T</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Active Nodes</span>
          <strong style={{ color: '#60a5fa', fontSize: '0.9rem' }}>{connectedCount}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Active Jobs</span>
          <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{activeJobs}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Completed</span>
          <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>{completedJobs}</strong>
        </div>
      </div>
    </div>
  );
};

export default MasterNode;
