package com.byteSwarm.bytesWarm.controller;

import com.byteSwarm.bytesWarm.service.ChunkDispatchService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/chunks")
public class ChunkController {

    private final ChunkDispatchService chunkDispatchService;

    public ChunkController(ChunkDispatchService chunkDispatchService) {
        this.chunkDispatchService = chunkDispatchService;
    }

    @PostMapping("/dispatch")
    public String dispatchChunk(@RequestBody List<String> chunk)
            throws IOException {

        boolean dispatched =
                chunkDispatchService.dispatchChunk(chunk);

        if (dispatched) {
            return "Chunk dispatched successfully!";
        }

        return "No worker available!";
    }
}