package com.byteSwarm.bytesWarm.service;
import java.util.List;
import com.byteSwarm.bytesWarm.model.TaskStatus;
import org.springframework.stereotype.Service;

import com.byteSwarm.bytesWarm.model.Task;
import com.byteSwarm.bytesWarm.repository.TaskRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }
    
    public List<Task> getAllTasks() {
        return taskRepository.findAll();

    }
    
    
    public Task updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(status);

        return taskRepository.save(task);
    }
}

