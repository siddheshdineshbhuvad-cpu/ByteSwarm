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
            System.out.println("No available worker.");
            return false;
        }

        if (worker.getSession() == null) {
            System.out.println("Worker session is not available.");
            return false;
        }

        String taskId = "TASK-" + System.currentTimeMillis();

        String message =
                "{"
                + "\"type\":\"START\","
                + "\"taskId\":\"" + taskId + "\","
                + "\"algorithm\":\"PRIME_COUNT\","
                + "\"params\":{"
                + "\"start\":1,"
                + "\"end\":100"
                + "}"
                + "}";

        worker.getSession().sendMessage(
                new TextMessage(message)
        );

        worker.setStatus("BUSY");

        System.out.println(
                "Task " + taskId +
                " dispatched to worker: " +
                worker.getWorkerId()
        );

        return true;
    }
}