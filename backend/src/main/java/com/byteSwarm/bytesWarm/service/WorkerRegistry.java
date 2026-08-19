package com.byteSwarm.bytesWarm.service;

import com.byteSwarm.bytesWarm.model.Worker;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WorkerRegistry {

    private final Map<String, Worker> workers = new ConcurrentHashMap<>();

    public void registerWorker(Worker worker) {
        workers.put(worker.getWorkerId(), worker);
    }

    public void removeWorker(String workerId) {
        workers.remove(workerId);
    }

    public Map<String, Worker> getWorkers() {
        return workers;
    }

    public Worker getAvailableWorker() {

        for (Worker worker : workers.values()) {

            if ("AVAILABLE".equals(worker.getStatus())) {
                return worker;
            }
        }

        return null;
    }
}