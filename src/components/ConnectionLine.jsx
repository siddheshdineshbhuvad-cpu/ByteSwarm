import React from 'react';

const ConnectionLine = ({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, status = 'IDLE' }) => {
  const isComputing = status === 'COMPUTING';
  const isCompleted = status === 'COMPLETED';
  const isDisconnected = status === 'DISCONNECTED';

  // Calculate curve control points for a smooth SVG bezier connection
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.4;
  const cy1 = y1 + dy * 0.1;
  const cx2 = x1 + dx * 0.6;
  const cy2 = y1 + dy * 0.9;

  const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  const strokeColor = isComputing
    ? '#38bdf8'
    : isCompleted
    ? '#34d399'
    : isDisconnected
    ? '#ef4444'
    : 'rgba(255, 255, 255, 0.2)';

  return (
    <g>
      {/* Background glow line */}
      <path
        d={pathData}
        fill="none"
        stroke={isComputing ? 'rgba(56, 189, 248, 0.35)' : 'none'}
        strokeWidth={isComputing ? 6 : 0}
        strokeLinecap="round"
      />

      {/* Main Connection Path */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isComputing ? 3 : isCompleted ? 2 : 1.5}
        strokeDasharray={isDisconnected ? '4,4' : isComputing ? '8,6' : 'none'}
        className={isComputing ? 'connection-active' : ''}
        opacity={isDisconnected ? 0.35 : 0.85}
      />

      {/* Pulsing data dot moving along line when computing */}
      {isComputing && (
        <circle r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)">
          <animateMotion path={pathData} dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};

export default ConnectionLine;
