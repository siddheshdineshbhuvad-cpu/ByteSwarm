import React, { useState, useEffect, useRef } from 'react';
import MasterNode from './MasterNode';
import WorkerNode from './WorkerNode';
import ConnectionLine from './ConnectionLine';
import { Network, Plus, Trash2, Play, RefreshCw, Server, Activity, ShieldCheck } from 'lucide-react';

const Topology = ({ ws = null, localWorkerId = null }) => {
  // Master Node status state
  const [masterStatus, setMasterStatus] = useState('online'); // 'online' | 'offline'
  const [masterStats, setMasterStats] = useState({
    host: 'localhost:8080',
    completedJobs: 96,
    activeJobs: 2
  });

  // Connected workers list in React state
  const [workers, setWorkers] = useState([
    { id: 'WORKER-001', status: 'COMPUTING', progress: 73, chunkId: 1042, algorithm: 'PRIME_COUNT', isLocal: true },
    { id: 'WORKER-002', status: 'IDLE', progress: 0, chunkId: null, algorithm: null },
    { id: 'WORKER-003', status: 'COMPUTING', progress: 45, chunkId: 1043, algorithm: 'PI_MONTE_CARLO' },
    { id: 'WORKER-004', status: 'COMPLETED', progress: 100, chunkId: 1040, algorithm: 'FIBONACCI' },
    { id: 'WORKER-005', status: 'IDLE', progress: 0, chunkId: null, algorithm: null }
  ]);

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 850, height: 520 });

  // Handle Container Resize for Responsive SVG Coordinates
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 850,
          height: 520
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Listen to WebSocket messages for live WORKER_STATUS updates
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle WORKER_STATUS real-time updates from Java Master Node
        if (data.type === 'WORKER_STATUS') {
          const { workerId, status, chunkId, progress, algorithm } = data;

          setWorkers((prevWorkers) => {
            const exists = prevWorkers.some((w) => w.id === workerId);
            if (exists) {
              return prevWorkers.map((w) =>
                w.id === workerId
                  ? { ...w, status, chunkId: chunkId ?? w.chunkId, progress: progress ?? w.progress, algorithm: algorithm ?? w.algorithm }
                  : w
              );
            } else {
              // Add new worker node dynamically
              return [
                ...prevWorkers,
                { id: workerId, status: status || 'CONNECTED', progress: progress || 0, chunkId: chunkId || null, algorithm: algorithm || null }
              ];
            }
          });
        }
      } catch (err) {
        console.error('Topology WebSocket error parsing event:', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  // Compute Layout Positions: Master in center, Workers positioned in a circular/radial layout around Master
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radiusX = Math.min(centerX - 130, 320);
  const radiusY = Math.min(centerY - 110, 190);

  const getWorkerPosition = (index, total) => {
    if (total === 0) return { x: centerX, y: centerY };
    // Distribute angles evenly starting from top (-90 deg)
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle)
    };
  };

  // ── Grid Actions ────────────────────────────────────────────────────────────
  const addWorker = () => {
    const nextNum = workers.length + 1;
    const newId = `WORKER-00${nextNum}`;
    setWorkers((prev) => [
      ...prev,
      { id: newId, status: 'IDLE', progress: 0, chunkId: null, algorithm: null }
    ]);
  };

  const removeWorker = () => {
    if (workers.length <= 1) return;
    setWorkers((prev) => prev.slice(0, -1));
  };

  // Simulate real-time calculation progress across workers
  const simulateJobDispatch = () => {
    // Pick an idle worker
    const idleWorker = workers.find((w) => w.status === 'IDLE' || w.status === 'COMPLETED');
    const targetId = idleWorker ? idleWorker.id : workers[0]?.id;
    if (!targetId) return;

    const randomChunk = Math.floor(1000 + Math.random() * 9000);
    const algos = ['PRIME_COUNT', 'PI_MONTE_CARLO', 'FIBONACCI', 'MATRIX_COMPUTE'];
    const chosenAlgo = algos[Math.floor(Math.random() * algos.length)];

    // Switch worker to COMPUTING
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === targetId
          ? { ...w, status: 'COMPUTING', progress: 10, chunkId: randomChunk, algorithm: chosenAlgo }
          : w
      )
    );

    setMasterStats((prev) => ({ ...prev, activeJobs: prev.activeJobs + 1 }));

    // Animate progress up to 100% then finish
    let p = 10;
    const interval = setInterval(() => {
      p += 22;
      if (p >= 100) {
        clearInterval(interval);
        setWorkers((prev) =>
          prev.map((w) =>
            w.id === targetId
              ? { ...w, status: 'COMPLETED', progress: 100 }
              : w
          )
        );
        setMasterStats((prev) => ({
          ...prev,
          activeJobs: Math.max(0, prev.activeJobs - 1),
          completedJobs: prev.completedJobs + 1
        }));
      } else {
        setWorkers((prev) =>
          prev.map((w) => (w.id === targetId ? { ...w, progress: p } : w))
        );
      }
    }, 600);
  };

  // Summary statistics
  const connectedCount = workers.filter((w) => w.status !== 'DISCONNECTED').length;
  const activeComputingCount = workers.filter((w) => w.status === 'COMPUTING').length;
  const idleCount = workers.filter((w) => w.status === 'IDLE' || w.status === 'CONNECTED').length;
  const completedCount = workers.filter((w) => w.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

      {/* ── Top Page Header ────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <Network size={22} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>BYTE SWARM</h2>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#a78bfa', padding: '0.2rem 0.6rem',
                borderRadius: '20px', letterSpacing: '0.05em'
              }}>
                WEEK 3
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#93c5fd', margin: 0, fontWeight: 500 }}>Live Network Topology</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
              Real-time visualization of the Java Netty Master Node and connected Web Worker client nodes.
            </p>
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={simulateJobDispatch}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.55rem 1rem', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)', transition: 'all 0.2s ease'
              }}
            >
              <Play size={15} />
              Simulate Job Dispatch
            </button>

            <button
              onClick={addWorker}
              style={{
                background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px',
                padding: '0.55rem 0.9rem', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={15} />
              Add Worker
            </button>

            <button
              onClick={removeWorker}
              style={{
                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
                padding: '0.55rem 0.9rem', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* ── Statistics Summary Bar ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CONNECTED WORKERS</span>
          <strong style={{ fontSize: '1.4rem', color: '#60a5fa', fontWeight: 800 }}>{connectedCount}</strong>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', borderLeft: '4px solid #38bdf8' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>ACTIVE (COMPUTING)</span>
          <strong style={{ fontSize: '1.4rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {activeComputingCount}
            {activeComputingCount > 0 && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'breathePulse 1s infinite' }} />
            )}
          </strong>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', borderLeft: '4px solid #94a3b8' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>IDLE WORKERS</span>
          <strong style={{ fontSize: '1.4rem', color: '#cbd5e1', fontWeight: 800 }}>{idleCount}</strong>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>COMPLETED JOBS</span>
          <strong style={{ fontSize: '1.4rem', color: '#34d399', fontWeight: 800 }}>{masterStats.completedJobs}</strong>
        </div>

      </div>

      {/* ── Network Topology Graph View Canvas ────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="glass-panel"
        style={{
          position: 'relative',
          height: `${dimensions.height}px`,
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.25), rgba(2, 6, 23, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* SVG Connection Lines Overlay */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {workers.map((w, index) => {
            const pos = getWorkerPosition(index, workers.length);
            return (
              <ConnectionLine
                key={w.id}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                status={w.status}
              />
            );
          })}
        </svg>

        {/* Master Node (Center) */}
        <div
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <MasterNode
            status={masterStatus}
            connectedCount={connectedCount}
            activeJobs={activeComputingCount}
            completedJobs={masterStats.completedJobs}
            host={masterStats.host}
          />
        </div>

        {/* Worker Nodes (Positioned dynamically around Master) */}
        {workers.map((w, index) => {
          const pos = getWorkerPosition(index, workers.length);
          return (
            <div
              key={w.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                transition: 'all 0.5s ease-out'
              }}
            >
              <WorkerNode
                id={w.id}
                status={w.status}
                progress={w.progress}
                chunkId={w.chunkId}
                algorithm={w.algorithm}
                isLocal={w.isLocal}
              />
            </div>
          );
        })}

        {/* Topology Legend Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            zIndex: 12,
            background: 'rgba(0,0,0,0.4)',
            padding: '0.4rem 0.85rem',
            borderRadius: '10px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'breathePulse 1s infinite' }} />
              <span>COMPUTING (Pulsing)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <span>COMPLETED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
              <span>IDLE</span>
            </div>
          </div>

          <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#a78bfa' }}>
            LIVE WEBSOCKET DATA MATRIX
          </div>
        </div>

      </div>

    </div>
  );
};

export default Topology;
