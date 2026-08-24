import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import WorkerStatus from './WorkerStatus';
import WorkerPanel from './WorkerPanel';
import ThreadIsolationCheck from './ThreadIsolationCheck';
import { Terminal, Cpu, Zap, ArrowRight, Activity } from 'lucide-react';

const Dashboard = () => {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('isolation') || path.includes('review') || path.includes('check')) return 'isolation';
      if (path.includes('worker')) return 'worker';
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab]           = useState(getInitialTab);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [workerId, setWorkerId]             = useState(null);
  const [logs, setLogs]                     = useState([]);
  const [incomingTask, setIncomingTask]     = useState(null);
  const [workerState, setWorkerState]       = useState('idle');
  const [tasksCompleted, setTasksCompleted] = useState(0);

  const wsRef = useRef(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }].slice(-10));
  };

  // Track completed tasks
  const handleWorkerStateChange = (state) => {
    setWorkerState(state);
    if (state === 'completed') {
      setTasksCompleted(n => n + 1);
    }
  };

  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      addLog('Attempting to connect to master node…');

      try {
        ws = new WebSocket('ws://localhost:8080/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          setConnectionStatus('connected');
          addLog('Connected to ByteSwarm Grid.');
          ws.send(JSON.stringify({ type: 'REGISTER_WORKER', browserInfo: navigator.userAgent }));
          addLog('Registration payload sent.');
          if (!workerId) {
            setWorkerId('WKR-' + Math.random().toString(36).substr(2, 6).toUpperCase());
          }
        };

        ws.onmessage = (event) => {
          addLog(`Received: ${event.data.substring(0, 50)}…`);
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'REGISTERED') {
              setWorkerId(data.workerId);
            } else if (data.type === 'COMPUTE_TASK' || data.type === 'CHUNK_TASK') {
              setIncomingTask(data);
              setActiveTab('worker');
            }
          } catch {}
        };

        ws.onclose = () => {
          setConnectionStatus('disconnected');
          addLog('Connection lost. Retrying in 5 seconds…');
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => ws.close();

      } catch {
        setConnectionStatus('disconnected');
        addLog('Failed to create WebSocket instance.');
      }
    };

    connectWebSocket();
    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // WorkerPanel is always mounted (but CSS-hidden when off-tab) so the
  // Web Worker thread is never destroyed/re-created on tab switch.

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="main-content">
        <Navbar connectionStatus={connectionStatus} />

        <div className="content-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* ── Page Header ────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                  {activeTab === 'worker' ? 'HTML5 Web Worker Compute Node' : 'ByteSwarm Dashboard'}
                </h2>
                {activeTab === 'worker' && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#a78bfa', padding: '0.2rem 0.6rem',
                    borderRadius: '20px', letterSpacing: '0.05em'
                  }}>
                    WEEK 2
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                {activeTab === 'worker'
                  ? 'Process background mathematical chunks, display progress, and emit results back to Java.'
                  : 'Monitor active grid contribution, WebSocket node status, and background threads.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                id="tab-btn-dashboard"
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'dashboard' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Overview
              </button>
              <button
                id="tab-btn-isolation"
                onClick={() => setActiveTab('isolation')}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  border: '1px solid rgba(16,185,129,0.3)',
                  background: activeTab === 'isolation' ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(16,185,129,0.1)',
                  color: activeTab === 'isolation' ? '#fff' : '#34d399',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Activity size={16} />
                Thread Isolation (Mid-Review)
              </button>
              <button
                id="tab-btn-worker"
                onClick={() => setActiveTab('worker')}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: activeTab === 'worker' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'worker' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Cpu size={16} />
                Worker Engine
                {workerState === 'computing' && (
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#38bdf8', flexShrink: 0,
                    animation: 'breathePulse 1.2s ease-in-out infinite'
                  }} />
                )}
              </button>
            </div>
          </div>

          {/* ── Worker Status Bar — visible on non-isolation tabs ── */}
          {activeTab !== 'isolation' && (
            <WorkerStatus
              workerId={workerId}
              connectionStatus={connectionStatus}
              workerState={workerState}
              tasksCompleted={tasksCompleted}
            />
          )}

          {/* ── Thread Isolation Check Component (Mid-Project Review) ── */}
          {activeTab === 'isolation' && (
            <ThreadIsolationCheck />
          )}

          {/* ── Worker Panel — always in DOM, hidden via CSS when off-tab ── */}
          <div style={{ display: activeTab === 'worker' ? 'block' : 'none' }}>
            <WorkerPanel
              workerId={workerId || 'WKR-GRID1'}
              ws={wsRef.current}
              incomingTask={incomingTask}
              onTaskProcessed={() => setIncomingTask(null)}
              onWorkerStateChange={handleWorkerStateChange}
            />
          </div>

          {/* ── Other tab views ─────────────────────────────────────── */}
          {activeTab === 'isolation' ? null : activeTab === 'topology' ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
              <Zap size={32} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
              <h3>Grid Topology View</h3>
              <p style={{ color: 'var(--text-muted)' }}>Visual representation of distributed worker nodes and Java Master cluster.</p>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
              <h3>Worker Node Configuration</h3>
              <p style={{ color: 'var(--text-muted)' }}>Adjust max memory allocations and Web Worker thread counts.</p>
            </div>
          ) : (
            <>
              {/* Overview Tab — compact Week 2 Worker summary card + WS logs */}

              {/* Week 2 Worker summary card */}
              <div className="glass-panel" style={{
                padding: '1.5rem', borderRadius: '16px',
                border: '1px solid rgba(59,130,246,0.2)',
                background: 'rgba(59,130,246,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      background: 'rgba(59,130,246,0.15)', padding: '0.6rem',
                      borderRadius: '10px', border: '1px solid rgba(59,130,246,0.25)'
                    }}>
                      <Cpu size={22} color="#60a5fa" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>HTML5 Web Worker Engine</span>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700,
                          background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
                          padding: '0.15rem 0.5rem', borderRadius: '20px', letterSpacing: '0.05em'
                        }}>WEEK 2</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                        Background computation active — {tasksCompleted} task{tasksCompleted !== 1 ? 's' : ''} completed this session.
                        Worker state: <strong style={{ color: workerState === 'computing' ? '#38bdf8' : workerState === 'completed' ? '#10b981' : 'var(--text-muted)' }}>{workerState.toUpperCase()}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('worker')}
                    style={{
                      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '0.6rem 1.1rem', fontWeight: 600, fontSize: '0.875rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.3)', transition: 'all 0.2s ease'
                    }}
                  >
                    Open Worker Panel <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* WebSocket Connection Logs */}
              <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Terminal size={16} />
                  Java WebSocket Connection Logs
                </h3>
                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem',
                  flex: 1, fontFamily: 'monospace', fontSize: '0.875rem',
                  color: 'var(--text-muted)', overflowY: 'auto'
                }}>
                  {logs.length === 0 ? (
                    <p style={{ opacity: 0.5 }}>Waiting for WebSocket activity…</p>
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
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
