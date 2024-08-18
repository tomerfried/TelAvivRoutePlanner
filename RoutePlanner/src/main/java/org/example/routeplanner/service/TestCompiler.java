package org.example.routeplanner.service;

import info.debatty.java.stringsimilarity.Cosine;

public class TestCompiler {

    public static void main(String[] args) {

        // Compute cosine similarity
        Cosine cosine = new Cosine();
        System.out.println(cosine.similarity("hello-world", "hello world"));
        System.out.println(cosine.similarity("hello world whatsapp", "hello world"));
    }
}
