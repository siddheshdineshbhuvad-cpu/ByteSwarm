package com.byteSwarm.bytesWarm.config;

import com.byteSwarm.bytesWarm.model.TaskResult;
import com.byteSwarm.bytesWarm.model.Worker;
import com.byteSwarm.bytesWarm.service.WorkerRegistry;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WorkerWebSocketHandler extends TextWebSocketHandler {

    private final WorkerRegistry workerRegistry;
    private final ObjectMapper objectMapper;

    public WorkerWebSocketHandler(
            WorkerRegistry workerRegistry,
            ObjectMapper objectMapper) {

        this.workerRegistry = workerRegistry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {

        String workerId = session.getId();

        Worker worker = new Worker(workerId, session);

        workerRegistry.registerWorker(worker);

        System.out.println(
                "Worker registered: " + workerId
        );
    }

    @Override
    protected void handleTextMessage(
            WebSocketSession session,
            TextMessage message) {

        String payload = message.getPayload();

        System.out.println(
                "Worker message: " + payload
        );

        if (payload.contains("\"type\":\"TASK_RESULT\"")) {

            System.out.println(
                    "TASK RESULT RECEIVED FROM WORKER"
            );

            try {

                TaskResult taskResult =
                        objectMapper.readValue(
                                payload,
                                TaskResult.class
                        );

                System.out.println(
                        "Task ID: " + taskResult.getTaskId()
                );

                System.out.println(
                        "Algorithm: " + taskResult.getAlgorithm()
                );

                System.out.println(
                        "Status: " + taskResult.getStatus()
                );

                System.out.println(
                        "Execution Time: "
                                + taskResult.getExecutionTimeMs()
                                + " ms"
                );

                Worker worker =
                        workerRegistry
                                .getWorkers()
                                .get(session.getId());

                if (worker != null) {

                    worker.setStatus("AVAILABLE");

                    System.out.println(
                            "Worker "
                                    + worker.getWorkerId()
                                    + " is now AVAILABLE"
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "Failed to parse TASK_RESULT: "
                                + e.getMessage()
                );
            }
        }
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status) {

        String workerId = session.getId();

        workerRegistry.removeWorker(workerId);

        System.out.println(
                "Worker removed: " + workerId
        );
    }
}