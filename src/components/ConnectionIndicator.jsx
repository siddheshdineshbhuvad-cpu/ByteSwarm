import React from 'react';
import { Server, ServerOff, Loader2 } from 'lucide-react';

const ConnectionIndicator = ({ status }) => {
  let config = {
    color: 'var(--status-disconnected)',
    text: 'Disconnected',
    icon: <ServerOff size={16} />,
    glow: 'rgba(239, 68, 68, 0.4)',
    pulse: false
  };

  if (status === 'connected') {
    config = {
      color: 'var(--status-connected)',
      text: 'Connected',
      icon: <Server size={16} />,
      glow: 'rgba(16, 185, 129, 0.4)',
      pulse: true
    };
  } else if (status === 'connecting') {
    config = {
      color: 'var(--status-connecting)',
      text: 'Connecting...',
      icon: <Loader2 size={16} className="animate-spin" />,
      glow: 'rgba(245, 158, 11, 0.4)',
      pulse: false
    };
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(0,0,0,0.2)',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      border: `1px solid ${config.color}40`
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: config.color,
        boxShadow: `0 0 10px ${config.glow}`,
      }} className={config.pulse ? 'animate-pulse' : ''} />
      <div style={{ color: config.color, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {config.icon}
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{config.text}</span>
      </div>
    </div>
  );
};

export default ConnectionIndicator;
