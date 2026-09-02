package com.hiringintelligence.config;

import java.util.ArrayList;
import java.util.List;

/**
 * Port of the {@code mulberry32} PRNG used by the frontend seed generator
 * ({@code src/db/seed.js}), so the synthetic candidate pool is reproducible.
 */
final class Rng {

    private int state;

    Rng(int seed) {
        this.state = seed;
    }

    double next() {
        state = state + 0x6d2b79f5;
        int t = (state ^ (state >>> 15)) * (state | 1);
        t = ((t + ((t ^ (t >>> 7)) * (t | 61))) ^ t);
        return Integer.toUnsignedLong(t ^ (t >>> 14)) / 4294967296d;
    }

    <T> T pick(List<T> arr) {
        return arr.get((int) Math.floor(next() * arr.size()));
    }

    <T> List<T> sample(List<T> arr, int n) {
        List<T> copy = new ArrayList<>(arr);
        List<T> out = new ArrayList<>();
        while (out.size() < n && !copy.isEmpty()) {
            out.add(copy.remove((int) Math.floor(next() * copy.size())));
        }
        return out;
    }
}
