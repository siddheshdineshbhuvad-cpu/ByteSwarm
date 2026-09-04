import React, { useState, useEffect, useRef } from 'react';
import MasterNode from './MasterNode';
import WorkerNode from './WorkerNode';
import ConnectionLine from './ConnectionLine';
import {
  Network,
  Plus,
  Trash2,
  Play
} from 'lucide-react';

const Topology = ({ ws = null, localWorkerId = null }) => {

  // ==========================================
  // MASTER NODE
  // ==========================================

  const [masterStatus, setMasterStatus] = useState('online');

  const [masterStats, setMasterStats] = useState({
    host: 'ws://localhost:8080',
    completedJobs: 96,
    activeJobs: 0
  });

  // ==========================================
  // WORKERS
  // ==========================================

  const [workers, setWorkers] = useState([]);

  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: 850,
    height: 520
  });

  // ==========================================
  // RESPONSIVE DIMENSIONS
  // ==========================================

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

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };

  }, []);

  // ==========================================
  // ADD LOCAL WORKER IMMEDIATELY
  // ==========================================

  useEffect(() => {

    if (!localWorkerId) {
      return;
    }

    setWorkers((prevWorkers) => {

      const alreadyExists = prevWorkers.some(
        (worker) => worker.id === localWorkerId
      );

      if (alreadyExists) {
        return prevWorkers;
      }

      return [
        ...prevWorkers,
        {
          id: localWorkerId,
          status: 'AVAILABLE',
          progress: 0,
          chunkId: null,
          algorithm: null,
          isLocal: true
        }
      ];

    });

  }, [localWorkerId]);

  // ==========================================
  // WEBSOCKET LIVE WORKER STATUS
  // ==========================================

  useEffect(() => {

    if (!ws) {
      return;
    }

    const handleMessage = (event) => {

      try {

        const data = JSON.parse(event.data);

        console.log(
          '[TOPOLOGY WS]',
          data
        );

        // ======================================
        // WORKER STATUS
        // ======================================

        if (data.type === 'WORKER_STATUS') {

          const workerId = data.workerId;
          const status = data.status || 'AVAILABLE';

          const progress =
            data.progress !== undefined
              ? data.progress
              : 0;

          const chunkId =
            data.chunkId ?? null;

          const algorithm =
            data.algorithm ?? null;

          setWorkers((prevWorkers) => {

            const existingWorker =
              prevWorkers.find(
                (worker) => worker.id === workerId
              );

            // ----------------------------------
            // UPDATE EXISTING WORKER
            // ----------------------------------

            if (existingWorker) {

              return prevWorkers.map((worker) => {

                if (worker.id !== workerId) {
                  return worker;
                }

                return {
                  ...worker,
                  status,
                  progress,
                  chunkId,
                  algorithm
                };

              });

            }

            // ----------------------------------
            // ADD NEW WORKER
            // ----------------------------------

            return [
              ...prevWorkers,
              {
                id: workerId,
                status,
                progress,
                chunkId,
                algorithm,
                isLocal:
                  workerId === localWorkerId
              }
            ];

          });

        }

        // ======================================
        // WORKER CONNECTED
        // ======================================

        if (data.type === 'WORKER_CONNECTED') {

          const workerId = data.workerId;

          if (!workerId) {
            return;
          }

          setWorkers((prevWorkers) => {

            const exists = prevWorkers.some(
              (worker) => worker.id === workerId
            );

            if (exists) {
              return prevWorkers;
            }

            return [
              ...prevWorkers,
              {
                id: workerId,
                status: 'AVAILABLE',
                progress: 0,
                chunkId: null,
                algorithm: null,
                isLocal:
                  workerId === localWorkerId
              }
            ];

          });

        }

        // ======================================
        // WORKER DISCONNECTED
        // ======================================

        if (data.type === 'WORKER_DISCONNECTED') {

          const workerId = data.workerId;

          setWorkers((prevWorkers) =>
            prevWorkers.filter(
              (worker) => worker.id !== workerId
            )
          );

        }

      } catch (error) {

        console.error(
          '[TOPOLOGY WS ERROR]',
          error
        );

      }

    };

    ws.addEventListener(
      'message',
      handleMessage
    );

    return () => {

      ws.removeEventListener(
        'message',
        handleMessage
      );

    };

  }, [ws, localWorkerId]);

  // ==========================================
  // MASTER NODE POSITION
  // ==========================================

  const centerX =
    dimensions.width / 2;

  const centerY =
    dimensions.height / 2;

  const radiusX =
    Math.min(centerX - 130, 320);

  const radiusY =
    Math.min(centerY - 110, 190);

  // ==========================================
  // WORKER RADIAL POSITION
  // ==========================================

  const getWorkerPosition = (
    index,
    total
  ) => {

    if (total === 0) {

      return {
        x: centerX,
        y: centerY
      };

    }

    const angle =
      (index / total) *
        2 *
        Math.PI -
      Math.PI / 2;

    return {

      x:
        centerX +
        radiusX *
        Math.cos(angle),

      y:
        centerY +
        radiusY *
        Math.sin(angle)

    };

  };

  // ==========================================
  // ADD DEMO WORKER
  // ==========================================

  const addWorker = () => {

    const nextNumber =
      workers.length + 1;

    const newId =
      `WORKER-00${nextNumber}`;

    setWorkers((prevWorkers) => [

      ...prevWorkers,

      {
        id: newId,
        status: 'AVAILABLE',
        progress: 0,
        chunkId: null,
        algorithm: null,
        isLocal: false
      }

    ]);

  };

  // ==========================================
  // REMOVE LAST WORKER
  // ==========================================

  const removeWorker = () => {

    if (workers.length === 0) {
      return;
    }

    setWorkers((prevWorkers) =>
      prevWorkers.slice(0, -1)
    );

  };

  // ==========================================
  // SIMULATE JOB
  // ==========================================

  const simulateJobDispatch = () => {

    const availableWorker =
      workers.find(
        (worker) =>
          worker.status === 'AVAILABLE' ||
          worker.status === 'IDLE' ||
          worker.status === 'COMPLETED'
      );

    const targetWorker =
      availableWorker || workers[0];

    if (!targetWorker) {
      return;
    }

    const randomChunk =
      Math.floor(
        1000 +
        Math.random() * 9000
      );

    const algorithms = [
      'PRIME_COUNT',
      'PI_MONTE_CARLO',
      'FIBONACCI',
      'MATRIX_COMPUTE'
    ];

    const selectedAlgorithm =
      algorithms[
        Math.floor(
          Math.random() *
          algorithms.length
        )
      ];

    // ========================================
    // START COMPUTING
    // ========================================

    setWorkers((prevWorkers) =>
      prevWorkers.map((worker) => {

        if (worker.id !== targetWorker.id) {
          return worker;
        }

        return {

          ...worker,

          status: 'COMPUTING',

          progress: 10,

          chunkId: randomChunk,

          algorithm: selectedAlgorithm

        };

      })
    );

    setMasterStats((prevStats) => ({
      ...prevStats,
      activeJobs:
        prevStats.activeJobs + 1
    }));

    // ========================================
    // PROGRESS ANIMATION
    // ========================================

    let progress = 10;

    const interval =
      setInterval(() => {

        progress += 20;

        if (progress >= 100) {

          clearInterval(interval);

          setWorkers((prevWorkers) =>
            prevWorkers.map((worker) => {

              if (
                worker.id !==
                targetWorker.id
              ) {
                return worker;
              }

              return {

                ...worker,

                status: 'COMPLETED',

                progress: 100

              };

            })
          );

          setMasterStats((prevStats) => ({

            ...prevStats,

            activeJobs:
              Math.max(
                0,
                prevStats.activeJobs - 1
              ),

            completedJobs:
              prevStats.completedJobs + 1

          }));

        } else {

          setWorkers((prevWorkers) =>
            prevWorkers.map((worker) => {

              if (
                worker.id !==
                targetWorker.id
              ) {
                return worker;
              }

              return {

                ...worker,

                progress

              };

            })
          );

        }

      }, 500);

  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const connectedCount =
    workers.filter(
      (worker) =>
        worker.status !==
        'DISCONNECTED'
    ).length;

  const activeComputingCount =
    workers.filter(
      (worker) =>
        worker.status ===
        'COMPUTING' ||
        worker.status ===
        'BUSY'
    ).length;

  const idleCount =
    workers.filter(
      (worker) =>
        worker.status ===
          'AVAILABLE' ||
        worker.status ===
          'IDLE'
    ).length;

  // ==========================================
  // UI
  // ==========================================

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%'
      }}
    >

      {/* =====================================
          HEADER
      ====================================== */}

      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          borderRadius: '16px'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >

          <div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.25rem'
              }}
            >

              <Network
                size={22}
                color="var(--accent-primary)"
              />

              <h2
                style={{
                  fontSize: '1.5rem',
                  margin: 0,
                  fontWeight: 700
                }}
              >
                BYTE SWARM
              </h2>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
                  border:
                    '1px solid rgba(139,92,246,0.3)',
                  color: '#a78bfa',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  letterSpacing: '0.05em'
                }}
              >
                WEEK 4
              </span>

            </div>

            <h3
              style={{
                fontSize: '1.1rem',
                color: '#93c5fd',
                margin: 0,
                fontWeight: 500
              }}
            >
              Live Network Topology
            </h3>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                marginBottom: 0
              }}
            >
              Real-time visualization of the Java Master Node and connected Web Worker nodes.
            </p>

          </div>

          {/* =================================
              CONTROLS
          ================================== */}

          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              flexWrap: 'wrap'
            }}
          >

            <button
              onClick={
                simulateJobDispatch
              }
              style={{
                background:
                  'linear-gradient(135deg, #2563eb, #38bdf8)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >

              <Play size={15} />

              Simulate Job Dispatch

            </button>

            <button
              onClick={addWorker}
              style={{
                background:
                  'rgba(59,130,246,0.12)',
                color: '#60a5fa',
                border:
                  '1px solid rgba(59,130,246,0.3)',
                borderRadius: '8px',
                padding: '0.55rem 0.9rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >

              <Plus size={15} />

              Add Worker

            </button>

            <button
              onClick={removeWorker}
              style={{
                background:
                  'rgba(239,68,68,0.1)',
                color: '#f87171',
                border:
                  '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '0.55rem 0.9rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >

              <Trash2 size={15} />

              Remove

            </button>

          </div>

        </div>

      </div>

      {/* =====================================
          STATISTICS
      ====================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}
      >

        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            borderLeft:
              '4px solid #3b82f6'
          }}
        >

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'block',
              fontWeight: 600
            }}
          >
            CONNECTED WORKERS
          </span>

          <strong
            style={{
              fontSize: '1.4rem',
              color: '#60a5fa',
              fontWeight: 800
            }}
          >
            {connectedCount}
          </strong>

        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            borderLeft:
              '4px solid #38bdf8'
          }}
        >

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'block',
              fontWeight: 600
            }}
          >
            ACTIVE (COMPUTING)
          </span>

          <strong
            style={{
              fontSize: '1.4rem',
              color: '#38bdf8',
              fontWeight: 800
            }}
          >
            {activeComputingCount}
          </strong>

        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            borderLeft:
              '4px solid #94a3b8'
          }}
        >

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'block',
              fontWeight: 600
            }}
          >
            IDLE WORKERS
          </span>

          <strong
            style={{
              fontSize: '1.4rem',
              color: '#cbd5e1',
              fontWeight: 800
            }}
          >
            {idleCount}
          </strong>

        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            borderLeft:
              '4px solid #10b981'
          }}
        >

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'block',
              fontWeight: 600
            }}
          >
            COMPLETED JOBS
          </span>

          <strong
            style={{
              fontSize: '1.4rem',
              color: '#34d399',
              fontWeight: 800
            }}
          >
            {masterStats.completedJobs}
          </strong>

        </div>

      </div>

      {/* =====================================
          TOPOLOGY GRAPH
      ====================================== */}

      <div
        ref={containerRef}
        className="glass-panel"
        style={{
          position: 'relative',
          height: `${dimensions.height}px`,
          borderRadius: '16px',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.25), rgba(2, 6, 23, 0.95))',
          border:
            '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >

        {/* =================================
            CONNECTION LINES
        ================================== */}

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

          {workers.map(
            (worker, index) => {

              const position =
                getWorkerPosition(
                  index,
                  workers.length
                );

              return (

                <ConnectionLine
                  key={worker.id}
                  x1={centerX}
                  y1={centerY}
                  x2={position.x}
                  y2={position.y}
                  status={worker.status}
                />

              );

            }
          )}

        </svg>

        {/* =================================
            MASTER NODE
        ================================== */}

        <div
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform:
              'translate(-50%, -50%)',
            zIndex: 10
          }}
        >

          <MasterNode
            status={masterStatus}
            connectedCount={connectedCount}
            activeJobs={activeComputingCount}
            completedJobs={
              masterStats.completedJobs
            }
            host={masterStats.host}
          />

        </div>

        {/* =================================
            WORKER NODES
        ================================== */}

        {workers.map(
          (worker, index) => {

            const position =
              getWorkerPosition(
                index,
                workers.length
              );

            return (

              <div
                key={worker.id}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform:
                    'translate(-50%, -50%)',
                  zIndex: 10,
                  transition:
                    'all 0.5s ease-out'
                }}
              >

                <WorkerNode
                  id={worker.id}
                  status={worker.status}
                  progress={worker.progress}
                  chunkId={worker.chunkId}
                  algorithm={worker.algorithm}
                  isLocal={worker.isLocal}
                />

              </div>

            );

          }
        )}

        {/* =================================
            EMPTY STATE
        ================================== */}

        {workers.length === 0 && (

          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '70px',
              transform:
                'translateX(-50%)',
              color: '#94a3b8',
              fontSize: '0.85rem'
            }}
          >
            Waiting for WebSocket workers...
          </div>

        )}

        {/* =================================
            LEGEND
        ================================== */}

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            zIndex: 12,
            background:
              'rgba(0,0,0,0.4)',
            padding:
              '0.4rem 0.85rem',
            borderRadius: '10px',
            backdropFilter:
              'blur(4px)'
          }}
        >

          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center'
            }}
          >

            <span>
              🔵 COMPUTING
            </span>

            <span>
              🟢 COMPLETED
            </span>

            <span>
              ⚪ AVAILABLE / IDLE
            </span>

          </div>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: '#a78bfa'
            }}
          >
            LIVE WEBSOCKET DATA
          </div>

        </div>

      </div>

    </div>

  );
};

export default Topology;