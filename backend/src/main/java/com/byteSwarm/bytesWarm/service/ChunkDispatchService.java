package com.byteSwarm.bytesWarm.service;

import com.byteSwarm.bytesWarm.model.Worker;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.List;

@Service
public class ChunkDispatchService {

    private final WorkerRegistry workerRegistry;

    public ChunkDispatchService(WorkerRegistry workerRegistry) {
        this.workerRegistry = workerRegistry;
    }

    public boolean dispatchChunk(List<String> chunk) throws IOException {

        Worker worker = workerRegistry.getAvailableWorker();

        if (worker == null) {
            System.out.println("[DISPATCH] No available worker.");
            return false;
        }

        return dispatchToWorker(
                worker,
                chunk,
                "TASK-" + System.currentTimeMillis()
        );
    }

    private boolean dispatchToWorker(
            Worker worker,
            List<String> chunk,
            String taskId) throws IOException {

        if (worker.getSession() == null ||
                !worker.getSession().isOpen()) {

            System.out.println(
                    "[DISPATCH FAILED] Worker session unavailable: "
                            + worker.getWorkerId()
            );

            return false;
        }

        String data = String.join("\n", chunk)
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");

        String message =
                "{"
                + "\"type\":\"CHUNK_TASK\","
                + "\"taskId\":\"" + taskId + "\","
                + "\"algorithm\":\"CHUNK_PROCESS\","
                + "\"chunkSize\":" + chunk.size() + ","
                + "\"data\":\"" + data + "\""
                + "}";

        worker.getSession().sendMessage(
                new TextMessage(message)
        );

        worker.setCurrentTaskId(taskId);
        worker.setCurrentChunk(chunk);
        worker.setStatus(Worker.BUSY);

        System.out.println(
                "[DISPATCH] Task " + taskId
                        + " dispatched to worker: "
                        + worker.getWorkerId()
        );

        return true;
    }

    public void recoverWorkerTask(String workerId) {

        Worker failedWorker =
                workerRegistry.getWorkers().get(workerId);

        if (failedWorker == null) {
            System.out.println(
                    "[RECOVERY] Worker not found: " + workerId
            );
            return;
        }

        List<String> failedChunk =
                failedWorker.getCurrentChunk();

        String failedTaskId =
                failedWorker.getCurrentTaskId();

        if (failedChunk == null || failedChunk.isEmpty()) {
            System.out.println(
                    "[RECOVERY] No unfinished task for worker: "
                            + workerId
            );
            return;
        }

        System.out.println(
                "[RECOVERY] Unfinished task detected: "
                        + failedTaskId
                        + " from worker "
                        + workerId
        );

        new Thread(() -> {

            for (int attempt = 1; attempt <= 30; attempt++) {

                Worker replacement =
                        workerRegistry.getAvailableWorker();

                if (replacement != null &&
                        !replacement.getWorkerId().equals(workerId)) {

                    try {

                        boolean success =
                                dispatchToWorker(
                                        replacement,
                                        failedChunk,
                                        failedTaskId
                                );

                        if (success) {
                            System.out.println(
                                    "[RECOVERY SUCCESS] Task "
                                            + failedTaskId
                                            + " reassigned from "
                                            + workerId
                                            + " to "
                                            + replacement.getWorkerId()
                            );
                            return;
                        }

                    } catch (IOException e) {

                        System.out.println(
                                "[RECOVERY ERROR] Could not reassign task "
                                        + failedTaskId
                        );
                    }
                }

                System.out.println(
                        "[RECOVERY RETRY] Attempt "
                                + attempt
                                + " - waiting for available worker..."
                );

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }

            System.out.println(
                    "[RECOVERY FAILED] No worker became available for task "
                            + failedTaskId
            );

        }).start();
    }
}