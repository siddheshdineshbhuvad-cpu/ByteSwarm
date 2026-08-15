package com.byteSwarm.bytesWarm.model;

public class Worker {

    private String workerId;
    private String status;

    public Worker(String workerId) {
        this.workerId = workerId;
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
}