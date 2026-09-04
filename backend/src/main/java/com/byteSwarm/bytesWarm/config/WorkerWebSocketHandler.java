package com.byteSwarm.bytesWarm.config;

import com.byteSwarm.bytesWarm.model.Worker;
import com.byteSwarm.bytesWarm.service.ChunkDispatchService;
import com.byteSwarm.bytesWarm.service.WorkerRegistry;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WorkerWebSocketHandler extends TextWebSocketHandler {

    private final WorkerRegistry workerRegistry;
    private final ChunkDispatchService chunkDispatchService;

    public WorkerWebSocketHandler(
            WorkerRegistry workerRegistry,
            ChunkDispatchService chunkDispatchService) {

        this.workerRegistry = workerRegistry;
        this.chunkDispatchService = chunkDispatchService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {

        String workerId = session.getId();

        Worker worker = new Worker(workerId, session);

        workerRegistry.registerWorker(worker);

        try {

            String statusMessage =
                    "{\"type\":\"WORKER_STATUS\","
                            + "\"workerId\":\"" + workerId + "\","
                            + "\"status\":\"" + Worker.AVAILABLE + "\","
                            + "\"progress\":0}";

            session.sendMessage(
                    new TextMessage(statusMessage)
            );

        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println(
                "[WORKER CONNECTED] Worker registered: "
                        + workerId
                        + " | Status: "
                        + Worker.AVAILABLE
        );
    }

    @Override
    protected void handleTextMessage(
            WebSocketSession session,
            TextMessage message) {

        String workerId = session.getId();
        String payload = message.getPayload();

        Worker worker =
                workerRegistry.getWorkers().get(workerId);

        System.out.println(
                "[WORKER MESSAGE] "
                        + workerId
                        + " -> "
                        + payload
        );

        if (worker == null) {

            System.out.println(
                    "[WORKER MESSAGE] Worker not found: "
                            + workerId
            );

            return;
        }

        // ==========================================
        // WORKER TASK COMPLETED
        // ==========================================

        if (payload.contains("\"type\":\"TASK_COMPLETED\"")
                || payload.contains("\"type\":\"TASK_RESULT\"")
                || payload.contains("\"status\":\"COMPLETED\"")
                || payload.contains("\"status\":\"SUCCESS\"")
                || payload.contains("COMPLETED")) {

            String completedTaskId =
                    worker.getCurrentTaskId();

            worker.clearCurrentTask();

            worker.setStatus(Worker.COMPLETED);

            System.out.println(
                    "[TASK COMPLETED] Task "
                            + completedTaskId
                            + " completed by worker "
                            + workerId
                            + " | Status: "
                            + Worker.COMPLETED
            );

            // Worker ready for next task
            worker.setStatus(Worker.AVAILABLE);

            System.out.println(
                    "[WORKER AVAILABLE] "
                            + workerId
                            + " is ready for next task."
            );
        }

        // ==========================================
        // WORKER TASK FAILED
        // ==========================================

        else if (payload.contains("\"type\":\"TASK_FAILED\"")
                || payload.contains("\"status\":\"FAILED\"")
                || payload.contains("FAILED")) {

            worker.setStatus(Worker.FAILED);

            System.out.println(
                    "[TASK FAILED] Worker "
                            + workerId
                            + " reported task failure."
            );

            // Recover unfinished task
            chunkDispatchService.recoverWorkerTask(workerId);
        }
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status) {

        String workerId = session.getId();

        Worker worker =
                workerRegistry.getWorkers().get(workerId);

        if (worker != null) {

            // ==========================================
            // WORKER FAILURE DETECTED
            // ==========================================

            worker.setStatus(Worker.FAILED);

            System.out.println(
                    "[WORKER FAILED] "
                            + workerId
                            + " disconnected."
                            + " Status: "
                            + Worker.FAILED
            );

            // ==========================================
            // RECOVER UNFINISHED CHUNK
            // ==========================================

            chunkDispatchService.recoverWorkerTask(workerId);

            // ==========================================
            // REMOVE FAILED WORKER
            // ==========================================

            workerRegistry.removeWorker(workerId);

            System.out.println(
                    "[WORKER REMOVED] "
                            + workerId
            );
        }
    }
}