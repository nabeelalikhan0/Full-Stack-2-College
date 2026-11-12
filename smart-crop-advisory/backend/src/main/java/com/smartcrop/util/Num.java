package com.smartcrop.util;

public final class Num {
    private Num() {}

    public static double r1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    public static double r2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
