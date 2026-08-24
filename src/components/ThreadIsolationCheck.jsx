import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Zap, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Play, MousePointerClick, RefreshCw, BarChart2 } from 'lucide-react';

const ThreadIsolationCheck = () => {
  const workerRef = useRef(null);

  // Status and metric states
  const [status, setStatus] = useState('Idle'); // 'Idle' | 'Computing' | 'Completed' | 'Frozen (Main Thread)'
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState(new Array(30).fill(60));
  const [workerProgress, setWorkerProgress] = useState(0);
  const [dataset, setDataset] = useState(100000000); // 100,000,000 iterations
  const [result, setResult] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);
  const [executionMode, setExecutionMode] = useState(null); // 'Web Worker' | 'Main Thread'
  const [userClicks, setUserClicks] = useState(0);
  const [workerSupported, setWorkerSupported] = useState(true);

  // 1. Web Worker Lifecycle Initialization
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Worker) {
      setWorkerSupported(false);
      return;
    }

    try {
      // Create Web Worker using ES module Worker URL pattern (supported natively by Vite)
      workerRef.current = new Worker(
        new URL('../workers/computeWorker.js', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const data = event.data;

        if (data.type === 'PROGRESS') {
          setWorkerProgress(data.progress);
        } else if (data.type === 'COMPLETED') {
          setStatus('Completed');
          setWorkerProgress(100);
          setResult(data.result);
          setExecutionTime(data.executionTime);
        }
      };

      workerRef.current.onerror = (err) => {
        console.error('Worker error:', err);
        setStatus('Error');
      };
    } catch (err) {
      console.error('Failed to initialize Web Worker:', err);
      setWorkerSupported(false);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // 2. High-precision FPS Monitoring with requestAnimationFrame
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animFrameId = null;

    function measureFPS() {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const calculatedFps = Math.round((frameCount * 1000) / elapsed);
        setFps(calculatedFps);
        setFpsHistory((prev) => [...prev.slice(1), calculatedFps]);
        frameCount = 0;
        lastTime = currentTime;
      }

      animFrameId = requestAnimationFrame(measureFPS);
    }

    animFrameId = requestAnimationFrame(measureFPS);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  // 3. Web Worker Computation (Isolated Thread - non-blocking)
  function startWorkerComputation() {
    if (!workerRef.current) return;

    setStatus('Computing');
    setWorkerProgress(0);
    setResult(null);
    setExecutionTime(0);
    setExecutionMode('Web Worker');

    workerRef.current.postMessage({
      iterations: dataset
    });
  }

  // 4. Main Thread Computation (UI Thread - intentional freeze demonstration)
  function startMainThreadComputation() {
    setStatus('Computing (Main Thread)');
    setWorkerProgress(0);
    setResult(null);
    setExecutionTime(0);
    setExecutionMode('Main Thread');

    // Force React UI to flush state updates before executing synchronously
    setTimeout(() => {
      const startTime = performance.now();
      let res = 0;

      // Heavy synchronous loop on the React JS Main Thread
      for (let i = 0; i < dataset; i++) {
        res += Math.sqrt(i) * Math.sin(i);
      }

      const elapsed = performance.now() - startTime;

      setResult(res);
      setExecutionTime(elapsed);
      setWorkerProgress(100);
      setStatus('Completed');
    }, 50);
  }

  const isComputing = status.startsWith('Computing');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Banner Header ────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>BYTE SWARM</h2>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399', padding: '0.25rem 0.75rem',
                borderRadius: '20px', letterSpacing: '0.05em'
              }}>
                MID-PROJECT REVIEW
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#93c5fd', margin: 0, fontWeight: 500 }}>Thread Isolation Check</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.4rem', maxWidth: '680px' }}>
              Demonstrates that heavy mathematical calculations executed inside an HTML5 Web Worker leave the React UI 100% responsive (~60 FPS), isolated from main thread rendering.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ShieldCheck size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ISOLATION STATUS</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                {executionMode === 'Main Thread' ? '⚠️ Main Thread Locked' : '🟢 Worker Isolated'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Display Grid ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* ── Card 1: Worker Status ────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} color="var(--accent-primary)" />
                Worker Status
              </h3>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                padding: '0.25rem 0.65rem', borderRadius: '20px',
                background: status === 'Computing' ? 'rgba(59,130,246,0.15)' : status === 'Completed' ? 'rgba(16,185,129,0.15)' : status.includes('Main Thread') ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                color: status === 'Computing' ? '#38bdf8' : status === 'Completed' ? '#34d399' : status.includes('Main Thread') ? '#f87171' : 'var(--text-muted)',
                border: `1px solid ${status === 'Computing' ? 'rgba(59,130,246,0.3)' : status === 'Completed' ? 'rgba(16,185,129,0.3)' : status.includes('Main Thread') ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`
              }}>
                {status === 'Computing' ? '🟢 COMPUTING' : status === 'Completed' ? '🟢 COMPLETED' : status.includes('Main Thread') ? '🔴 COMPUTING (MAIN)' : '⚪ IDLE'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong style={{ color: status === 'Computing' ? '#38bdf8' : status === 'Completed' ? '#34d399' : 'var(--text-main)' }}>
                  {status}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dataset Size:</span>
                <select
                  value={dataset}
                  onChange={(e) => setDataset(Number(e.target.value))}
                  disabled={isComputing}
                  style={{
                    background: 'rgba(15,23,42,0.8)', color: '#60a5fa', fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                    padding: '0.2rem 0.5rem', fontSize: '0.85rem', outline: 'none'
                  }}
                >
                  <option value={50000000}>50,000,000 iterations</option>
                  <option value={100000000}>100,000,000 iterations</option>
                  <option value={200000000}>200,000,000 iterations</option>
                </select>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>Worker Progress</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{workerProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{
                    width: `${workerProgress}%`,
                    height: '100%',
                    background: status.includes('Main Thread') ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #2563eb, #38bdf8)',
                    borderRadius: '5px',
                    transition: 'width 0.15s ease-out'
                  }} />
                </div>
              </div>

              {executionTime > 0 && (
                <div style={{
                  background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)',
                  padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.85rem', marginTop: '0.25rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Execution Time:</span>
                  <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                    {executionTime.toFixed(2)} ms
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Card 2: UI Responsiveness Monitor ────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color={fps >= 50 ? '#34d399' : '#f87171'} />
                UI Responsiveness
              </h3>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                padding: '0.25rem 0.65rem', borderRadius: '20px',
                background: fps >= 50 ? 'rgba(16,185,129,0.15)' : fps >= 30 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: fps >= 50 ? '#34d399' : fps >= 30 ? '#fbbf24' : '#f87171',
                border: `1px solid ${fps >= 50 ? 'rgba(16,185,129,0.3)' : fps >= 30 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}>
                {fps >= 50 ? '🟢 RESPONSIVE' : fps >= 30 ? '🟡 SLOWING' : '🔴 FROZEN'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>FPS (Frames Per Second):</span>
                <span style={{
                  fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace',
                  color: fps >= 50 ? '#34d399' : fps >= 30 ? '#fbbf24' : '#f87171'
                }}>
                  {fps} FPS
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>UI Status:</span>
                <strong style={{ color: fps >= 50 ? '#34d399' : fps >= 30 ? '#fbbf24' : '#f87171' }}>
                  {fps >= 50 ? '🟢 Responsive (~60 FPS)' : fps >= 30 ? '🟡 Lagging' : '🔴 Thread Blocked'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Animation Status:</span>
                <strong style={{ color: fps >= 45 ? '#34d399' : '#f87171' }}>
                  {fps >= 45 ? '🟢 RUNNING' : '🔴 STALLED'}
                </strong>
              </div>

              {/* Real-time FPS Sparkline */}
              <div style={{ marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  <span>FPS Stability Graph</span>
                  <span>Target: 60 FPS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '32px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '6px' }}>
                  {fpsHistory.map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${Math.min(100, (val / 60) * 100)}%`,
                        background: val >= 50 ? '#10b981' : val >= 30 ? '#f59e0b' : '#ef4444',
                        borderRadius: '1px',
                        transition: 'height 0.2s ease'
                      }}
                      title={`${val} FPS`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ── Visual Motion Test Track (Continuously Moving Animation) ────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="#38bdf8" />
              Continuous Motion &amp; Interaction Test Track
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              The glowing orb moves continuously. If main thread freezes, this motion stutters or stops completely.
            </p>
          </div>

          <button
            onClick={() => setUserClicks(c => c + 1)}
            style={{
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <MousePointerClick size={14} />
            Test UI Click: <strong style={{ color: '#fff' }}>{userClicks} clicks</strong>
          </button>
        </div>

        {/* Moving Orb Track */}
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '1rem', position: 'relative', overflow: 'hidden', height: '70px',
          display: 'flex', alignItems: 'center'
        }}>
          {/* Track line */}
          <div style={{ position: 'absolute', left: '20px', right: '20px', height: '2px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Smooth Bouncing Orb using CSS moveTrack keyframes */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8)',
              boxShadow: '0 0 20px #3b82f6, 0 0 35px rgba(59,130,246,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              animation: 'moveTrack 2.5s ease-in-out infinite',
              willChange: 'transform'
            }}
          >
            🔵
          </div>

          <div style={{ position: 'absolute', right: '15px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ← continuously moving →
          </div>
        </div>
      </div>

      {/* ── Control Action Buttons (Main Thread vs Web Worker comparison) ────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', textAlign: 'center' }}>
          Test Comparison: Web Worker (Isolated) vs Main Thread (Blocking)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

          {/* Web Worker Button (RECOMMENDED & ISOLATED) */}
          <button
            onClick={startWorkerComputation}
            disabled={isComputing}
            style={{
              background: isComputing ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              color: '#fff', border: 'none', borderRadius: '12px',
              padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.95rem',
              cursor: isComputing ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
              boxShadow: isComputing ? 'none' : '0 6px 20px rgba(59,130,246,0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={18} />
              <span>Start Web Worker Computation</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 400 }}>
              🟢 UI stays 100% responsive (~60 FPS)
            </span>
          </button>

          {/* Main Thread Button (BLOCKING & FROZEN DEMO) */}
          <button
            onClick={startMainThreadComputation}
            disabled={isComputing}
            style={{
              background: isComputing ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)',
              color: '#f87171', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '12px',
              padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.95rem',
              cursor: isComputing ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              <span>Start Main Thread Computation</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 400 }}>
              🔴 Will freeze React UI &amp; stop animation
            </span>
          </button>

        </div>
      </div>

      {/* ── Computation Result Display ────────────────────────────────────────── */}
      {result !== null && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.3)', animation: 'fadeInUp 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#34d399" />
              Computation Result ({executionMode})
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {executionTime.toFixed(2)} ms elapsed
            </span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.95rem', overflowX: 'auto', color: '#60a5fa' }}>
            Result = {result.toString()}
          </div>
        </div>
      )}

      {/* ── Key Review Summary Statement Card ────────────────────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '1.5rem', borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(30,58,138,0.25), rgba(17,24,39,0.7))',
        border: '1px solid rgba(59,130,246,0.25)'
      }}>
        <h4 style={{ fontSize: '0.9rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Review Summary Statement
        </h4>
        <blockquote style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid #3b82f6', paddingLeft: '1rem', margin: 0 }}>
          "The computational workload is isolated from the React main thread, allowing the UI to remain responsive at approximately 60 FPS while the Web Worker performs CPU-intensive calculations."
        </blockquote>
      </div>

    </div>
  );
};

export default ThreadIsolationCheck;
