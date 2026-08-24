// HTML5 Web Worker for Thread Isolation Check
// Mid-Project Review – ByteSwarm

self.onmessage = function (event) {
    const { iterations = 100000000 } = event.data || {};
    const start = performance.now();
    let result = 0;

    const chunkSize = Math.max(100000, Math.floor(iterations / 100));

    for (let i = 0; i < iterations; i++) {
        result += Math.sqrt(i) * Math.sin(i);

        // Send progress updates periodically for smooth UI progress bar
        if (i % chunkSize === 0 || i === iterations - 1) {
            const progress = Math.min(100, Math.round(((i + 1) / iterations) * 100));
            self.postMessage({
                type: "PROGRESS",
                progress,
                currentStep: i + 1,
                totalSteps: iterations
            });
        }
    }

    const executionTime = performance.now() - start;

    self.postMessage({
        type: "COMPLETED",
        result,
        executionTime
    });
};
