package com.byteSwarm.bytesWarm.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.byteSwarm.bytesWarm.model.Task;
import com.byteSwarm.bytesWarm.model.TaskStatus;
import com.byteSwarm.bytesWarm.service.TaskService;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PutMapping("/{id}/status")
    public Task updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {

        return taskService.updateTaskStatus(id, status);
    }
    @PutMapping("/test")
    public String testPut() {
        return "PUT is working!";
    }
}