package com.byteSwarm.bytesWarm.config;

import com.byteSwarm.bytesWarm.model.Worker;
import com.byteSwarm.bytesWarm.service.WorkerRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WorkerWebSocketHandler extends TextWebSocketHandler {

    private final WorkerRegistry workerRegistry;

    public WorkerWebSocketHandler(WorkerRegistry workerRegistry) {
        this.workerRegistry = workerRegistry;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {

        String workerId = session.getId();

       Worker worker = new Worker(workerId, session);
        workerRegistry.registerWorker(worker);

        System.out.println("Worker registered: " + workerId);
    }

    @Override
    protected void handleTextMessage(
            WebSocketSession session,
            TextMessage message) {

        System.out.println(
                "Worker message: " + message.getPayload()
        );
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