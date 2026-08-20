import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProgressBar from './ProgressBar';
import ResultCard from './ResultCard';
import ConsoleLogs from './ConsoleLogs';
import { Cpu, Play, Square, RefreshCw, Send, Layers, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const ALGO_PRESETS = {
  PRIME_COUNT:    { label: 'Prime Numbers Range Search',  description: 'Count all primes in range [1, N] using trial division.' },
  PI_MONTE_CARLO: { label: 'Monte Carlo π Estimation',    description: 'Estimate π by sampling random points in a unit circle.' },
  FIBONACCI:      { label: 'BigInt Fibonacci Sequence',   description: 'Compute the Nth Fibonacci number using arbitrary-precision BigInt.' },
  MATRIX_COMPUTE: { label: 'N×N Matrix Multiplication',  description: 'Multiply two N×N matrices using sin/cos-initialised values.' },
};

const WorkerPanel = ({ workerId = 'WKR-8492', ws = null, incomingTask = null, onTaskProcessed = null, onWorkerStateChange = null }) => {
  const [status, setStatus]             = useState('idle');   // 'idle' | 'computing' | 'completed' | 'cancelled' | 'error'
  const [progress, setProgress]         = useState(0);
  const [currentStep, setCurrentStep]   = useState(0);
  const [totalSteps, setTotalSteps]     = useState(0);
  const [intermediate, setIntermediate] = useState(null);
  const [resultData, setResultData]     = useState(null);
  const [emitStatus, setEmitStatus]     = useState(null);     // 'sent' | 'offline'
  const [logs, setLogs]                 = useState([]);
  const [workerReady, setWorkerReady]   = useState(false);
  const [workerSupported, setWorkerSupported] = useState(true);

  // Algorithm selection and parameters
  const [selectedAlgo, setSelectedAlgo] = useState('PRIME_COUNT');
  const [params, setParams] = useState({
    start: 1,
    end: 5000000,
    iterations: 20000000,
    n: 400000,
    matrixSize: 350
  });

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [elapsedTime, setElapsedTime]   = useState(0);

  const workerRef    = useRef(null);
  const timerRef     = useRef(null);
  const startTimeRef = useRef(0);
  const wsRef        = useRef(ws);

  // Keep wsRef in sync without re-running effects
  useEffect(() => { wsRef.current = ws; }, [ws]);

  // ── Logging helper ────────────────────────────────────────────────────────
  const addLog = useCallback((message, source = 'MAIN', type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), time, message, source, type }].slice(-150));
  }, []);

  // ── Emit result to Java Master via WebSocket ──────────────────────────────
  const emitResultToJavaMaster = useCallback((resPayload) => {
    const javaPayload = {
      type:           'TASK_RESULT',
      workerId:       workerId,
      taskId:         resPayload.taskId,
      algorithm:      resPayload.algorithm,
      status:         'SUCCESS',
      executionTimeMs: resPayload.durationMs,
      result:         resPayload.result,
      timestamp:      Date.now()
    };

    const currentWs = wsRef.current;
    if (currentWs && currentWs.readyState === WebSocket.OPEN) {
      currentWs.send(JSON.stringify(javaPayload));
      addLog(`[WEBSOCKET] Emitted result for [${resPayload.taskId}] → Java Master Node.`, 'JAVA', 'success');
      setEmitStatus('sent');
    } else {
      addLog(`Simulated emission of [${resPayload.taskId}] to Java Master Node (Offline Mode).`, 'JAVA', 'info');
      setEmitStatus('offline');
    }
  }, [workerId, addLog]);

  // ── Initialise Web Worker — runs once on mount ───────────────────────────
  useEffect(() => {
    if (!window.Worker) {
      setWorkerSupported(false);
      addLog('HTML5 Web Workers are NOT supported in this environment.', 'MAIN', 'error');
      return;
    }

    addLog('Initialising HTML5 Web Worker background thread…', 'MAIN', 'info');

    let workerInstance = null;
    try {
      workerInstance = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });
    } catch {
      try {
        workerInstance = new Worker('/worker.js');
      } catch (err) {
        addLog(`Failed to create Web Worker: ${err.message}`, 'MAIN', 'error');
        setWorkerSupported(false);
        return;
      }
    }

    workerRef.current = workerInstance;

    // Ping worker to confirm it's alive
    workerInstance.postMessage({ type: 'PING' });

    workerInstance.onmessage = (event) => {
      const data = event.data;
      const { type, taskId, progress: p, currentStep: cs, totalSteps: ts, intermediate: inter, result, durationMs, error, message, algorithmLabel } = data;

      switch (type) {
        case 'PONG':
          setWorkerReady(true);
          addLog('Web Worker thread confirmed alive (PONG received).', 'WORKER', 'success');
          break;

        case 'STARTED':
          setStatus('computing');
          setProgress(0);
          setCurrentStep(0);
          addLog(`Background computation started: [${taskId}] → ${algorithmLabel || data.algorithm}`, 'WORKER', 'info');
          break;

        case 'PROGRESS':
          setStatus('computing');
          setProgress(p || 0);
          if (cs !== undefined) setCurrentStep(cs);
          if (ts !== undefined) setTotalSteps(ts);
          if (inter) setIntermediate(inter);
          break;

        case 'RESULT': {
          setStatus('completed');
          setProgress(100);
          if (timerRef.current) clearInterval(timerRef.current);
          const totalDuration = durationMs || (Date.now() - startTimeRef.current);
          const resPayload = {
            taskId,
            algorithm: data.algorithm || selectedAlgo,
            algorithmLabel: algorithmLabel || ALGO_PRESETS[data.algorithm]?.label || data.algorithm,
            durationMs: totalDuration,
            result,
            timestamp: Date.now()
          };
          setResultData(resPayload);
          addLog(`✓ Computation finished in ${totalDuration.toLocaleString()}ms for [${taskId}]`, 'WORKER', 'success');
          emitResultToJavaMaster(resPayload);
          if (onWorkerStateChange) onWorkerStateChange('completed');
          break;
        }

        case 'CANCELLED':
          setStatus('cancelled');
          if (timerRef.current) clearInterval(timerRef.current);
          addLog(message || `Task [${taskId}] was cancelled.`, 'WORKER', 'warning');
          if (onWorkerStateChange) onWorkerStateChange('cancelled');
          break;

        case 'ERROR':
          setStatus('error');
          if (timerRef.current) clearInterval(timerRef.current);
          addLog(`Worker error on [${taskId}]: ${error}`, 'WORKER', 'error');
          if (onWorkerStateChange) onWorkerStateChange('error');
          break;

        default:
          break;
      }
    };

    workerInstance.onerror = (err) => {
      setStatus('error');
      if (timerRef.current) clearInterval(timerRef.current);
      addLog(`Web Worker unhandled exception: ${err.message}`, 'WORKER', 'error');
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (workerRef.current) {
        workerRef.current.terminate();
        addLog('Web Worker terminated on component unmount.', 'MAIN', 'info');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty: worker lives for the lifetime of this component

  // ── Notify parent of status changes ──────────────────────────────────────
  useEffect(() => {
    if (onWorkerStateChange) onWorkerStateChange(status);
  }, [status, onWorkerStateChange]);

  // ── Handle incoming WebSocket tasks from Java Master ──────────────────────
  useEffect(() => {
    if (incomingTask && incomingTask.taskId) {
      addLog(`Received computation chunk [${incomingTask.taskId}] from Java Master Node!`, 'JAVA', 'info');
      executeWorkerTask(incomingTask.taskId, incomingTask.algorithm || 'PRIME_COUNT', incomingTask.params || {});
      if (onTaskProcessed) onTaskProcessed(incomingTask.taskId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingTask]);

  // ── Dispatch task to Web Worker ───────────────────────────────────────────
  const executeWorkerTask = (taskIdOverride = null, algoOverride = null, paramsOverride = null) => {
    if (!workerRef.current) {
      addLog('Worker thread is not initialised!', 'MAIN', 'error');
      return;
    }

    const taskId    = taskIdOverride || `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
    const algo      = algoOverride  || selectedAlgo;
    const taskParams = paramsOverride || params;

    setActiveTaskId(taskId);
    setStatus('computing');
    setProgress(0);
    setCurrentStep(0);
    setTotalSteps(0);
    setIntermediate(null);
    setResultData(null);
    setEmitStatus(null);
    setElapsedTime(0);

    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 100);

    addLog(`postMessage → Worker: START [${taskId}] | ${ALGO_PRESETS[algo]?.label || algo}`, 'MAIN', 'info');
    workerRef.current.postMessage({ type: 'START', taskId, algorithm: algo, params: taskParams });
    if (onWorkerStateChange) onWorkerStateChange('computing');
  };

  // ── Cancel task ───────────────────────────────────────────────────────────
  const terminateCurrentTask = () => {
    if (workerRef.current && activeTaskId) {
      addLog(`Sending CANCEL signal for task [${activeTaskId}]…`, 'MAIN', 'warning');
      workerRef.current.postMessage({ type: 'CANCEL', taskId: activeTaskId });
      setStatus('cancelled');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // ── Simulate Java Master Node dispatch ────────────────────────────────────
  const handleSimulateJavaDispatch = () => {
    const mockTaskId = `JAVA-CHUNK-${Math.floor(1000 + Math.random() * 9000)}`;
    addLog(`[JAVA SIMULATOR] Dispatching chunk ${mockTaskId} to Worker Node`, 'JAVA', 'warning');
    executeWorkerTask(mockTaskId, selectedAlgo, params);
  };

  const isComputing = status === 'computing';

  // ── Unsupported browser fallback ──────────────────────────────────────────
  if (!workerSupported) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
        <AlertTriangle size={40} color="#f87171" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#f87171', marginBottom: '0.5rem' }}>Web Workers Not Supported</h3>
        <p style={{ color: 'var(--text-muted)' }}>Your browser does not support the HTML5 Web Worker API. Please use a modern browser (Chrome, Firefox, Edge, Safari 15+).</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>

      {/* ── Loading Overlay ──────────────────────────────────────────────── */}
      {isComputing && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          borderRadius: '16px',
          background: 'rgba(2, 6, 23, 0.45)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            border: '4px solid rgba(59,130,246,0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ color: '#93c5fd', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.03em' }}>
            Background thread computing…
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {(elapsedTime / 1000).toFixed(1)}s elapsed — UI remains responsive
          </span>
        </div>
      )}

      {/* ── Header Panel ─────────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Cpu size={22} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>HTML5 Web Worker Compute Engine</h2>

              {isComputing && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'rgba(59,130,246,0.12)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(59,130,246,0.3)',
                  animation: 'breathe 2s ease-in-out infinite'
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#3b82f6',
                    animation: 'breathePulse 1.2s ease-in-out infinite'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>Thread Active</span>
                </div>
              )}

              {workerReady && !isComputing && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(16,185,129,0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(16,185,129,0.25)'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>Worker Ready</span>
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Offloads heavy mathematical calculations to <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>worker.js</code>, keeping the React UI 100% responsive.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* WS Status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(0,0,0,0.3)',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {ws && ws.readyState === WebSocket.OPEN
                ? <Wifi size={14} color="#10b981" />
                : <WifiOff size={14} color="#64748b" />
              }
              <span style={{ fontSize: '0.75rem', color: ws && ws.readyState === WebSocket.OPEN ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                {ws && ws.readyState === WebSocket.OPEN ? 'WS Connected' : 'Offline Mode'}
              </span>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.85rem', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)', textAlign: 'right'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ASSIGNED WORKER</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{workerId}</span>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.85rem', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)', textAlign: 'right'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>WORKER STATE</span>
              <span style={{
                fontWeight: 700, fontSize: '0.9rem',
                color: isComputing ? '#38bdf8' : status === 'completed' ? 'var(--status-connected)' : status === 'error' ? '#f87171' : 'var(--text-muted)'
              }}>
                {status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Task Configurator ────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-primary)" />
          Workload Configuration &amp; Execution
        </h3>

        {/* Algorithm description */}
        {ALGO_PRESETS[selectedAlgo] && (
          <div style={{
            background: 'rgba(59,130,246,0.07)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#93c5fd'
          }}>
            {ALGO_PRESETS[selectedAlgo].description}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>

          {/* Algorithm Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              MATHEMATICAL ALGORITHM
            </label>
            <select
              id="algo-select"
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              disabled={isComputing}
              style={{
                width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px',
                background: 'rgba(15,23,42,0.8)', color: 'var(--text-main)',
                border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', outline: 'none'
              }}
            >
              <option value="PRIME_COUNT">Prime Numbers Range Search</option>
              <option value="PI_MONTE_CARLO">Monte Carlo π Estimation</option>
              <option value="FIBONACCI">BigInt Fibonacci Sequence</option>
              <option value="MATRIX_COMPUTE">N×N Matrix Operations</option>
            </select>
          </div>

          {/* Dynamic Parameters */}
          {selectedAlgo === 'PRIME_COUNT' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>RANGE END (1 to N)</label>
              <input id="param-prime-end" type="number" value={params.end} disabled={isComputing}
                onChange={(e) => setParams({ ...params, end: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', outline: 'none' }} />
            </div>
          )}

          {selectedAlgo === 'PI_MONTE_CARLO' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>RANDOM SAMPLES COUNT</label>
              <input id="param-monte-iter" type="number" value={params.iterations} disabled={isComputing}
                onChange={(e) => setParams({ ...params, iterations: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', outline: 'none' }} />
            </div>
          )}

          {selectedAlgo === 'FIBONACCI' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>FIBONACCI TERM (N)</label>
              <input id="param-fib-n" type="number" value={params.n} disabled={isComputing}
                onChange={(e) => setParams({ ...params, n: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', outline: 'none' }} />
            </div>
          )}

          {selectedAlgo === 'MATRIX_COMPUTE' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>MATRIX DIMENSION (N×N)</label>
              <input id="param-matrix-size" type="number" value={params.matrixSize} disabled={isComputing}
                onChange={(e) => setParams({ ...params, matrixSize: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', outline: 'none' }} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            id="btn-execute"
            onClick={() => executeWorkerTask()}
            disabled={isComputing}
            style={{
              background: isComputing ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '0.65rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
              cursor: isComputing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: isComputing ? 'none' : '0 4px 14px rgba(59,130,246,0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isComputing ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Computing in Background…
              </>
            ) : (
              <>
                <Play size={16} />
                Execute Math Workload
              </>
            )}
          </button>

          <button
            id="btn-java-dispatch"
            onClick={handleSimulateJavaDispatch}
            disabled={isComputing}
            style={{
              background: 'rgba(168,85,247,0.12)', color: '#c084fc',
              border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px',
              padding: '0.65rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
              cursor: isComputing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} />
            Simulate Java Master Dispatch
          </button>

          {isComputing && (
            <button
              id="btn-terminate"
              onClick={terminateCurrentTask}
              style={{
                background: 'rgba(239,68,68,0.12)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                padding: '0.65rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Square size={16} />
              Terminate Worker
            </button>
          )}

          {!isComputing && status !== 'idle' && (
            <button
              id="btn-reset"
              onClick={() => {
                setStatus('idle'); setProgress(0); setCurrentStep(0);
                setTotalSteps(0); setIntermediate(null); setResultData(null);
                setEmitStatus(null); setElapsedTime(0);
              }}
              style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '0.65rem 1rem', fontWeight: 500, fontSize: '0.875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={14} />
              Reset Panel
            </button>
          )}
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      <ProgressBar
        progress={progress}
        currentStep={currentStep}
        totalSteps={totalSteps}
        intermediate={intermediate}
        status={status}
        elapsedTime={elapsedTime}
      />

      {/* ── Result Card ──────────────────────────────────────────────────── */}
      <ResultCard
        resultData={resultData}
        workerId={workerId}
        emitStatus={emitStatus}
        onReEmit={() => resultData && emitResultToJavaMaster(resultData)}
      />

      {/* ── Console Logs ─────────────────────────────────────────────────── */}
      <ConsoleLogs logs={logs} onClear={() => setLogs([])} />

    </div>
  );
};

export default WorkerPanel;
