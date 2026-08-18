package com.byteSwarm.bytesWarm.test;

import com.byteSwarm.bytesWarm.service.ChunkingService;

import java.util.List;

public class ChunkingTest {

    public static void main(String[] args) throws Exception {

        ChunkingService chunkingService = new ChunkingService();

        List<List<String>> chunks =
                chunkingService.createChunks("dataset.txt");

        System.out.println("Total chunks: " + chunks.size());
        System.out.println("First chunk size: " + chunks.get(0).size());
        System.out.println("Last chunk size: " +
                chunks.get(chunks.size() - 1).size());
    }
}