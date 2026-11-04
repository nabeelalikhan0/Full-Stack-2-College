package com.example.cicd.unit;

import com.example.cicd.service.CalculatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Assignment 1 - Unit Testing with JUnit 5 (as specified in Experiment 9 PDF)
 * Tests individual methods and functions in isolation.
 */
public class CalculatorServiceTest {

    private CalculatorService calculator;

    @BeforeEach
    void setUp() {
        calculator = new CalculatorService();
    }

    @Test
    @DisplayName("Test Addition logic: 2 + 3 = 5 (Directly from Experiment 9 PDF)")
    void testAdd() {
        int result = calculator.add(2, 3);
        assertEquals(5, result, "2 + 3 should equal 5");
    }

    @Test
    @DisplayName("Test Subtraction logic: 10 - 4 = 6")
    void testSubtract() {
        int result = calculator.subtract(10, 4);
        assertEquals(6, result);
    }

    @Test
    @DisplayName("Test Multiplication logic: 4 * 5 = 20")
    void testMultiply() {
        int result = calculator.multiply(4, 5);
        assertEquals(20, result);
    }

    @Test
    @DisplayName("Test Division logic: 10 / 2 = 5.0")
    void testDivide() {
        double result = calculator.divide(10, 2);
        assertEquals(5.0, result);
    }

    @Test
    @DisplayName("Test Division by zero throws IllegalArgumentException")
    void testDivideByZero() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            calculator.divide(10, 0);
        });
        assertEquals("Cannot divide by zero", exception.getMessage());
    }

    @Test
    @DisplayName("Test Even Number check")
    void testIsEven() {
        assertTrue(calculator.isEven(4));
        assertFalse(calculator.isEven(7));
    }
}

