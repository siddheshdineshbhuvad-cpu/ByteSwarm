import React from 'react';
import { Hash, Activity } from 'lucide-react';

const WorkerStatus = ({ workerId, connectionStatus }) => {
  const isConnected = connectionStatus === 'connected';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} color="var(--accent-primary)" />
        Worker Node Status
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem' 
      }}>
        {/* Worker ID Card */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Worker ID</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hash size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '1.125rem', fontFamily: 'monospace', fontWeight: 600 }}>
              {workerId || 'Pending...'}
            </span>
          </div>
        </div>

        {/* Node Status Card */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Current State</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? 'var(--status-connected)' : 'var(--text-muted)',
              boxShadow: isConnected ? '0 0 10px var(--status-connected)' : 'none'
            }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: isConnected ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {isConnected ? 'Idle / Ready' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerStatus;
