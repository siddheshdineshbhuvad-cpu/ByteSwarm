import React from 'react';
import { Cpu, Zap, Clock, Timer } from 'lucide-react';

const ProgressBar = ({
  progress = 0,
  currentStep = 0,
  totalSteps = 0,
  intermediate = null,
  status = 'idle',
  elapsedTime = 0
}) => {
  const safeProgress  = Math.min(100, Math.max(0, progress));
  const isComputing   = status === 'computing';
  const isCompleted   = status === 'completed';
  const isCancelled   = status === 'cancelled';
  const isError       = status === 'error';

  const formatStep = (num) => (num ? Number(num).toLocaleString() : '0');

  // Throughput calculation (steps per second)
  const opsPerSec = elapsedTime > 0 && currentStep > 0
    ? Math.round(currentStep / (elapsedTime / 1000))
    : 0;

  // ETA estimation
  const remaining = totalSteps - currentStep;
  const etaSec = opsPerSec > 0 && remaining > 0
    ? Math.ceil(remaining / opsPerSec)
    : null;

  const formatEta = (s) => {
    if (s === null) return null;
    if (s < 60) return `~${s}s remaining`;
    const m = Math.ceil(s / 60);
    return `~${m}m remaining`;
  };

  // Bar fill colour
  const fillGradient = isCompleted
    ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
    : isCancelled
      ? 'linear-gradient(90deg, #b45309 0%, #f59e0b 100%)'
      : isError
        ? 'linear-gradient(90deg, #991b1b 0%, #ef4444 100%)'
        : 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 55%, #38bdf8 100%)';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        borderRadius: '14px',
        border: isCompleted
          ? '1px solid rgba(16,185,129,0.25)'
          : isComputing
            ? '1px solid rgba(59,130,246,0.2)'
            : '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color 0.4s ease'
      }}
    >
      {/* ── Header Row ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu
            size={18}
            color={isComputing ? 'var(--accent-primary)' : isCompleted ? 'var(--status-connected)' : 'var(--text-muted)'}
            style={isComputing ? { animation: 'breathePulse 1.5s ease-in-out infinite' } : {}}
          />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Worker Task Computation Progress</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isComputing && opsPerSec > 0 && (
            <span style={{
              fontSize: '0.75rem', color: '#38bdf8',
              background: 'rgba(56,189,248,0.1)',
              padding: '0.2rem 0.6rem', borderRadius: '20px',
              display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              <Zap size={12} />
              {opsPerSec.toLocaleString()} ops/sec
            </span>
          )}

          {isComputing && etaSec !== null && (
            <span style={{
              fontSize: '0.75rem', color: '#a78bfa',
              background: 'rgba(167,139,250,0.1)',
              padding: '0.2rem 0.6rem', borderRadius: '20px',
              display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              <Timer size={12} />
              {formatEta(etaSec)}
            </span>
          )}

          <span style={{
            fontSize: '1.125rem', fontWeight: 700, fontFamily: 'monospace',
            color: isCompleted ? 'var(--status-connected)' : isCancelled ? '#f59e0b' : isError ? '#f87171' : 'var(--accent-primary)',
            transition: 'color 0.3s ease'
          }}>
            {safeProgress}%
          </span>
        </div>
      </div>

      {/* ── Progress Track ───────────────────────────────────────────── */}
      <div style={{
        width: '100%', height: '14px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: '10px', padding: '2px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          height: '100%',
          width: `${safeProgress}%`,
          borderRadius: '8px',
          background: fillGradient,
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
          boxShadow: isComputing ? '0 0 18px rgba(59,130,246,0.6)' : isCompleted ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
          // Stripe overlay when computing
          ...(isComputing && {
            backgroundImage: `
              linear-gradient(90deg, #1d4ed8 0%, #3b82f6 55%, #38bdf8 100%),
              repeating-linear-gradient(
                -45deg,
                transparent 0px,
                transparent 8px,
                rgba(255,255,255,0.12) 8px,
                rgba(255,255,255,0.12) 16px
              )
            `,
            backgroundBlendMode: 'overlay',
            animation: 'progress-stripes 1s linear infinite',
          }),
          // Shimmer sweep on complete
          ...(isCompleted && {
            backgroundImage: `
              linear-gradient(90deg, #059669 0%, #10b981 50%, rgba(255,255,255,0.15) 55%, #10b981 60%, #059669 100%)
            `,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s ease forwards',
          })
        }} />
      </div>

      {/* ── Footer Metrics ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.75rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          {totalSteps > 0 ? (
            <span>
              Step <strong style={{ color: 'var(--text-main)' }}>{formatStep(currentStep)}</strong> / {formatStep(totalSteps)}
            </span>
          ) : (
            <span>Awaiting computation chunk…</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {intermediate && (
            <div style={{ fontFamily: 'monospace', color: '#93c5fd', fontSize: '0.78rem' }}>
              {intermediate.primeCount   !== undefined && `Primes found: ${intermediate.primeCount.toLocaleString()}`}
              {intermediate.currentPiEstimate !== undefined && `π ≈ ${intermediate.currentPiEstimate}`}
              {intermediate.row          !== undefined && `Row ${intermediate.row}/${intermediate.totalRows}`}
              {intermediate.status       && intermediate.status}
            </div>
          )}

          {elapsedTime > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              <span>{(elapsedTime / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
