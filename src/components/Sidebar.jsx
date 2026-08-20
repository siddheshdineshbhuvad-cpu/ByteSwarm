import React from 'react';
import { LayoutDashboard, Cpu, Network, Settings } from 'lucide-react';

const Sidebar = ({ activeTab = 'dashboard', onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'worker', icon: <Cpu size={20} />, label: 'Worker Integration' },
    { id: 'topology', icon: <Network size={20} />, label: 'Grid Topology' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
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
      
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <div 
            key={item.id} 
            onClick={() => onTabChange && onTabChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
            }}
          >
            {item.icon}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;
