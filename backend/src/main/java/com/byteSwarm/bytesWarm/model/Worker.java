package com.byteSwarm.bytesWarm.model;

import org.springframework.web.socket.WebSocketSession;

import java.util.List;

public class Worker {

    public static final String AVAILABLE = "AVAILABLE";
    public static final String BUSY = "BUSY";
    public static final String COMPLETED = "COMPLETED";
    public static final String FAILED = "FAILED";

    private String workerId;
    private String status;
    private WebSocketSession session;

    // Day 16: Track currently running chunk
    private String currentTaskId;
    private List<String> currentChunk;

    public Worker(String workerId) {
        this.workerId = workerId;
        this.status = AVAILABLE;
    }

    public Worker(String workerId, WebSocketSession session) {
        this.workerId = workerId;
        this.session = session;
        this.status = AVAILABLE;
    }

    public String getWorkerId() {
        return workerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public WebSocketSession getSession() {
        return session;
    }

    public String getCurrentTaskId() {
        return currentTaskId;
    }

    public void setCurrentTaskId(String currentTaskId) {
        this.currentTaskId = currentTaskId;
    }

    public List<String> getCurrentChunk() {
        return currentChunk;
    }

    public void setCurrentChunk(List<String> currentChunk) {
        this.currentChunk = currentChunk;
    }

    public void clearCurrentTask() {
        this.currentTaskId = null;
        this.currentChunk = null;
    }
}