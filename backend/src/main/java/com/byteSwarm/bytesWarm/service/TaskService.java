package com.byteSwarm.bytesWarm.service;
import java.util.List;
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
}
