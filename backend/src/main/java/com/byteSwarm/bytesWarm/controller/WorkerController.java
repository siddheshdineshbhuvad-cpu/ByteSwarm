package com.byteSwarm.bytesWarm.controller;

import com.byteSwarm.bytesWarm.model.Worker;
import com.byteSwarm.bytesWarm.service.WorkerRegistry;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/workers")
public class WorkerController {

    private final WorkerRegistry workerRegistry;

    public WorkerController(WorkerRegistry workerRegistry) {
        this.workerRegistry = workerRegistry;
    }

    @PostMapping("/register")
    public Worker registerWorker(@RequestParam String workerId) {

        Worker worker = new Worker(workerId);

        workerRegistry.registerWorker(worker);

        return worker;
    }

    @GetMapping
    public Map<String, Worker> getWorkers() {
        return workerRegistry.getWorkers();
    }

    @DeleteMapping("/{workerId}")
    public String removeWorker(@PathVariable String workerId) {

        workerRegistry.removeWorker(workerId);

        return "Worker removed: " + workerId;
    }
}