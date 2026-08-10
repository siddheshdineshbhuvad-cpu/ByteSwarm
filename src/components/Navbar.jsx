import React from 'react';
import { Activity, Cpu } from 'lucide-react';
import ConnectionIndicator from './ConnectionIndicator';

const Navbar = ({ connectionStatus }) => {
  return (
    <nav className="glass-panel" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem',
      margin: '1rem',
      marginBottom: '0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          background: 'var(--accent-primary)', 
          padding: '0.5rem', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--accent-glow)'
        }}>
          <Activity size={24} color="white" />
        </div>
        <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>ByteSwarm</h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Cpu size={18} />
          <span style={{ fontSize: '0.875rem' }}>Master Node: Active</span>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </div>
    </nav>
  );
};

export default Navbar;
