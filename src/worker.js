// Web Worker for ByteSwarm Distributed Compute Node
// Week 2 – Background Math Engine

let currentTaskId = null;
let isCancelled = false;

const ALGORITHM_META = {
  PRIME_COUNT: { label: 'Prime Numbers Range Search', unit: 'numbers' },
  PI_MONTE_CARLO: { label: 'Monte Carlo π Estimation', unit: 'samples' },
  FIBONACCI: { label: 'BigInt Fibonacci Sequence', unit: 'terms' },
  MATRIX_COMPUTE: { label: 'N×N Matrix Multiplication', unit: 'cells' },
};

self.onmessage = function(e) {
  const { type, taskId, algorithm, params } = e.data;

  // Health-check: reply immediately so UI can verify the worker thread is alive
  if (type === 'PING') {
    self.postMessage({ type: 'PONG', timestamp: Date.now() });
    return;
  }

  if (type === 'CANCEL') {
    if (taskId === currentTaskId) {
      isCancelled = true;
      self.postMessage({
        type: 'CANCELLED',
        taskId: taskId,
        message: 'Task execution cancelled by user/master node'
      });
    }
    return;
  }

  if (type === 'START') {
    currentTaskId = taskId;
    isCancelled = false;
    runTask(taskId, algorithm, params || {});
  }
};

async function runTask(taskId, algorithm, params) {
  const startTime = performance.now();
  const meta = ALGORITHM_META[algorithm] || { label: algorithm, unit: 'steps' };

  self.postMessage({
    type: 'STARTED',
    taskId: taskId,
    algorithm: algorithm,
    algorithmLabel: meta.label,
    unit: meta.unit,
    timestamp: Date.now()
  });

  try {
    let result = null;

    switch (algorithm) {
      case 'PRIME_COUNT':
        result = await computePrimeCount(taskId, params);
        break;
      case 'PI_MONTE_CARLO':
        result = await computeMonteCarloPi(taskId, params);
        break;
      case 'FIBONACCI':
        result = await computeFibonacci(taskId, params);
        break;
      case 'MATRIX_COMPUTE':
        result = await computeMatrix(taskId, params);
        break;
      default:
        result = await computePrimeCount(taskId, params);
        break;
    }

    if (isCancelled) return;

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    self.postMessage({
      type: 'RESULT',
      taskId: taskId,
      algorithm: algorithm,
      algorithmLabel: meta.label,
      result: result,
      durationMs: durationMs,
      timestamp: Date.now()
    });

  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      taskId: taskId,
      error: error.message || 'Error occurred during calculation'
    });
  }
}

// ─── 1. PRIME COUNT ───────────────────────────────────────────────────────────
async function computePrimeCount(taskId, params) {
  const start = Number(params.start) || 1;
  const end = Number(params.end) || 5000000;
  const total = end - start + 1;

  let primeCount = 0;
  let lastPrime = 2;

  const CHUNK_SIZE = Math.max(10000, Math.floor(total / 100));

  for (let i = start; i <= end; i++) {
    if (isCancelled) return null;

    if (isPrime(i)) {
      primeCount++;
      lastPrime = i;
    }

    if ((i - start + 1) % CHUNK_SIZE === 0 || i === end) {
      const processed = i - start + 1;
      const progress = Math.min(100, Math.round((processed / total) * 100));
      self.postMessage({
        type: 'PROGRESS',
        taskId: taskId,
        progress: progress,
        currentStep: processed,
        totalSteps: total,
        intermediate: { primeCount, lastPrime }
      });
      await yieldToEventLoop();
    }
  }

  return {
    primeCount,
    lastPrime,
    range: `[${start.toLocaleString()} – ${end.toLocaleString()}]`
  };
}

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// ─── 2. MONTE CARLO PI ────────────────────────────────────────────────────────
async function computeMonteCarloPi(taskId, params) {
  const totalSamples = Number(params.iterations) || 20000000;
  let insideCircle = 0;

  const CHUNK_SIZE = Math.max(50000, Math.floor(totalSamples / 100));

  for (let i = 1; i <= totalSamples; i++) {
    if (isCancelled) return null;

    const x = Math.random();
    const y = Math.random();
    if (x * x + y * y <= 1) insideCircle++;

    if (i % CHUNK_SIZE === 0 || i === totalSamples) {
      const progress = Math.min(100, Math.round((i / totalSamples) * 100));
      const currentPiEstimate = (4 * insideCircle) / i;
      self.postMessage({
        type: 'PROGRESS',
        taskId: taskId,
        progress: progress,
        currentStep: i,
        totalSteps: totalSamples,
        intermediate: { currentPiEstimate: currentPiEstimate.toFixed(6), insideCircle }
      });
      await yieldToEventLoop();
    }
  }

  const piEstimate = (4 * insideCircle) / totalSamples;
  const errorPercentage = Math.abs(piEstimate - Math.PI) / Math.PI * 100;

  return {
    piEstimate: piEstimate.toFixed(8),
    actualPi: Math.PI.toString(),
    errorPercentage: errorPercentage.toFixed(6) + '%',
    totalSamples: totalSamples.toLocaleString()
  };
}

// ─── 3. FIBONACCI ─────────────────────────────────────────────────────────────
async function computeFibonacci(taskId, params) {
  const n = Number(params.n) || 500000;

  self.postMessage({
    type: 'PROGRESS',
    taskId: taskId,
    progress: 1,
    currentStep: 0,
    totalSteps: n,
    intermediate: { status: 'Initialising BigInt arithmetic…' }
  });

  let a = 0n;
  let b = 1n;

  const CHUNK_STEP = Math.max(2000, Math.floor(n / 100));

  for (let i = 2; i <= n; i++) {
    if (isCancelled) return null;

    const c = a + b;
    a = b;
    b = c;

    if (i % CHUNK_STEP === 0 || i === n) {
      const progress = Math.min(100, Math.round((i / n) * 100));
      self.postMessage({
        type: 'PROGRESS',
        taskId: taskId,
        progress: progress,
        currentStep: i,
        totalSteps: n,
        intermediate: { status: `Computed Fib(${i.toLocaleString()})` }
      });
      await yieldToEventLoop();
    }
  }

  const fibStr = b.toString();
  return {
    n: n.toLocaleString(),
    digitsCount: fibStr.length.toLocaleString(),
    first10Digits: fibStr.slice(0, 10),
    last10Digits: fibStr.slice(-10)
  };
}

// ─── 4. MATRIX MULTIPLICATION ─────────────────────────────────────────────────
async function computeMatrix(taskId, params) {
  const size = Number(params.matrixSize) || 300;
  const totalCells = size * size;

  const A = new Array(size);
  const B = new Array(size);
  for (let i = 0; i < size; i++) {
    A[i] = new Float64Array(size);
    B[i] = new Float64Array(size);
    for (let j = 0; j < size; j++) {
      A[i][j] = Math.sin(i + j);
      B[i][j] = Math.cos(i - j);
    }
  }

  let computedCells = 0;
  let checksum = 0;

  for (let i = 0; i < size; i++) {
    if (isCancelled) return null;

    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += A[i][k] * B[k][j];
      }
      checksum += sum;
      computedCells++;
    }

    const progress = Math.min(100, Math.round((computedCells / totalCells) * 100));
    self.postMessage({
      type: 'PROGRESS',
      taskId: taskId,
      progress: progress,
      currentStep: computedCells,
      totalSteps: totalCells,
      intermediate: { row: i + 1, totalRows: size, checksum: checksum.toFixed(2) }
    });
    await yieldToEventLoop();
  }

  return {
    matrixDimensions: `${size} × ${size}`,
    totalOperations: (size * size * size).toLocaleString(),
    checksum: checksum.toFixed(4)
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function yieldToEventLoop() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
