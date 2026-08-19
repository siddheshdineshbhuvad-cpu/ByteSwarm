package com.byteSwarm.bytesWarm.model;

import org.springframework.web.socket.WebSocketSession;

public class Worker {

    private String workerId;
    private String status;
    private WebSocketSession session;

    public Worker(String workerId) {
        this.workerId = workerId;
        this.status = "AVAILABLE";
    }

    public Worker(String workerId, WebSocketSession session) {
        this.workerId = workerId;
        this.session = session;
        this.status = "AVAILABLE";
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
}