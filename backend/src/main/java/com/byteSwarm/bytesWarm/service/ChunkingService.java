package com.byteSwarm.bytesWarm.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChunkingService {

    private static final int CHUNK_SIZE = 1000;

    public List<List<String>> createChunks(String filePath) throws IOException {

        List<String> equations = Files.readAllLines(Path.of(filePath));

        List<List<String>> chunks = new ArrayList<>();

        for (int i = 0; i < equations.size(); i += CHUNK_SIZE) {

            int end = Math.min(i + CHUNK_SIZE, equations.size());

            List<String> chunk = equations.subList(i, end);

            chunks.add(new ArrayList<>(chunk));
        }

        return chunks;
    }
}