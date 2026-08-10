import React from 'react';
import { LayoutDashboard, Network, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <Network size={20} />, label: 'Grid Topology', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <aside className="glass-panel" style={{ 
      width: '250px', 
      margin: '1rem', 
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Menu</p>
      </div>
      
      {navItems.map((item, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          background: item.active ? 'rgba(255,255,255,0.05)' : 'transparent',
          color: item.active ? 'var(--text-main)' : 'var(--text-muted)',
          transition: 'all 0.2s ease',
          borderLeft: item.active ? '3px solid var(--accent-primary)' : '3px solid transparent'
        }}>
          {item.icon}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
