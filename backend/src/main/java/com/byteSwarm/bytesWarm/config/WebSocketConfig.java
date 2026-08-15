package com.byteSwarm.bytesWarm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WorkerWebSocketHandler workerWebSocketHandler;

    public WebSocketConfig(WorkerWebSocketHandler workerWebSocketHandler) {
        this.workerWebSocketHandler = workerWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {

        registry.addHandler(workerWebSocketHandler, "/worker-ws")
                .setAllowedOriginPatterns("*");
    }
}