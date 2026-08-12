package com.byteSwarm.bytesWarm.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.byteSwarm.bytesWarm.model.Task;
import com.byteSwarm.bytesWarm.service.TaskService;



import com.byteSwarm.bytesWarm.model.TaskStatus;

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
}