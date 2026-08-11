package com.byteSwarm.bytesWarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.byteSwarm.bytesWarm.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

}