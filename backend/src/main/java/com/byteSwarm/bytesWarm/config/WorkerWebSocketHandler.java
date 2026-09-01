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
    public void afterConnectionEstablished(
            WebSocketSession session) {

        String workerId = session.getId();

        Worker worker = new Worker(workerId, session);

        workerRegistry.registerWorker(worker);

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

        // Worker completed current task
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

            worker.setStatus(Worker.AVAILABLE);

            System.out.println(
                    "[WORKER AVAILABLE] "
                            + workerId
                            + " is ready for next task."
            );
        }

        // Worker explicitly reports failure
        else if (payload.contains("\"type\":\"TASK_FAILED\"")
                || payload.contains("\"status\":\"FAILED\"")
                || payload.contains("FAILED")) {

            worker.setStatus(Worker.FAILED);

            System.out.println(
                    "[TASK FAILED] Worker "
                            + workerId
                            + " reported task failure."
            );

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

            worker.setStatus(Worker.FAILED);

            System.out.println(
                    "[WORKER FAILED] "
                            + workerId
                            + " disconnected."
                            + " Status: "
                            + Worker.FAILED
            );

            // Recover unfinished chunk
            chunkDispatchService.recoverWorkerTask(workerId);

            workerRegistry.removeWorker(workerId);

            System.out.println(
                    "[WORKER REMOVED] "
                            + workerId
            );
        }
    }
}