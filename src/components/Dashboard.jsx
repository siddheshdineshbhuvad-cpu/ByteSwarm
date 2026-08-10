import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import WorkerStatus from './WorkerStatus';
import { Terminal } from 'lucide-react';

const Dashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [workerId, setWorkerId] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }].slice(-5));
  };

  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      addLog('Attempting to connect to master node...');
      
      try {
        ws = new WebSocket('ws://localhost:8080/ws');

        ws.onopen = () => {
          setConnectionStatus('connected');
          addLog('Connected to ByteSwarm Grid.');
          // Simulate registration
          const registerPayload = JSON.stringify({ type: 'REGISTER_WORKER', browserInfo: navigator.userAgent });
          ws.send(registerPayload);
          addLog('Registration payload sent.');
          
          // Generate a mock ID if server doesn't respond yet (for UI demo purposes)
          if (!workerId) {
             const mockId = 'WKR-' + Math.random().toString(36).substr(2, 6).toUpperCase();
             setWorkerId(mockId);
          }
        };

        ws.onmessage = (event) => {
          addLog(`Received message: ${event.data.substring(0, 50)}...`);
          try {
             const data = JSON.parse(event.data);
             if (data.type === 'REGISTERED') {
                 setWorkerId(data.workerId);
             }
          } catch(e) {}
        };

        ws.onclose = () => {
          setConnectionStatus('disconnected');
          addLog('Connection lost. Retrying in 5 seconds...');
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket Error:', error);
          ws.close();
        };

      } catch (error) {
        setConnectionStatus('disconnected');
        addLog('Failed to create WebSocket instance.');
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []); // Only run once on mount

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Navbar connectionStatus={connectionStatus} />
        
        <div className="content-area" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Overview</h2>
              <p style={{ color: 'var(--text-muted)' }}>Monitor your active contribution to the ByteSwarm grid.</p>
            </div>
          </div>

          <WorkerStatus workerId={workerId} connectionStatus={connectionStatus} />
          
          {/* Terminal / Logs panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Terminal size={16} />
              Connection Logs
            </h3>
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '8px', 
              padding: '1rem',
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              overflowY: 'auto'
            }}>
              {logs.length === 0 ? (
                <p style={{ opacity: 0.5 }}>Waiting for activity...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>[{log.time}]</span>
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
