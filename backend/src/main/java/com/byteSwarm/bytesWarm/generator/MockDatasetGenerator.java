
package com.byteSwarm.bytesWarm.generator;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Random;

public class MockDatasetGenerator {

    public static void main(String[] args) {

        String fileName = "dataset.txt";
        int totalEquations = 100000;

        Random random = new Random();

        try (FileWriter writer = new FileWriter(fileName)) {

            for (int i = 0; i < totalEquations; i++) {

                int a = random.nextInt(100) + 1;
                int b = random.nextInt(100) + 1;

                int result = a + b;

                writer.write(a + " + " + b + " = " + result);
                writer.write(System.lineSeparator());
            }

            System.out.println(
                    totalEquations + " equations generated successfully!"
            );

        } catch (IOException e) {
            System.out.println("Error creating dataset: " + e.getMessage());
        }
    }
}

