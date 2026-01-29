package com.enterprise.taskmanager;

import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.scheduling.CriticalPathEngine;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for CriticalPathEngine.
 * No mocks, pure deterministic tests.
 */
public class CriticalPathEngineTest {

    @Test
    void shouldCalculateCriticalPathWithDependencies() {
        List<Task> tasks = List.of(
            new Task("1", "A", 5, 5, LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "B", 3, 5, LocalDateTime.now().plusDays(2), List.of("1")),
            new Task("3", "C", 2, 5, LocalDateTime.now().plusDays(3), List.of("2"))
        );

        int critical = CriticalPathEngine.calculate(tasks);
        // A(5) + B(3) + C(2) = 10 hours
        assertEquals(10, critical);
    }

    @Test
    void shouldHandleEmptyTaskList() {
        int critical = CriticalPathEngine.calculate(List.of());
        assertEquals(0, critical);
    }

    @Test
    void shouldHandleTasksWithNoDependencies() {
        List<Task> tasks = List.of(
            new Task("1", "A", 5, 5, LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "B", 3, 5, LocalDateTime.now().plusDays(2), List.of()),
            new Task("3", "C", 2, 5, LocalDateTime.now().plusDays(3), List.of())
        );

        int critical = CriticalPathEngine.calculate(tasks);
        // No dependencies, max time is 5 (longest single task)
        assertEquals(5, critical);
    }

    @Test
    void shouldCalculatePERTEstimate() {
        // optimistic=2, likely=4, pessimistic=8
        double estimate = CriticalPathEngine.pertEstimate(2, 4, 8);
        // (2 + 4*4 + 8) / 6 = 26 / 6 ≈ 4.33
        assertEquals(4.33, estimate, 0.01);
    }

    @Test
    void shouldIdentifyCriticalTasks() {
        List<Task> tasks = List.of(
            new Task("1", "A", 10, 5, LocalDateTime.now().plusDays(1), List.of())
        );

        List<String> critical = CriticalPathEngine.getCriticalPath(tasks);
        assertEquals(1, critical.size());
        assertTrue(critical.contains("1"));
    }

    @Test
    void shouldHandleParallelTasks() {
        List<Task> tasks = List.of(
            new Task("1", "A", 5, 5, LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "B", 7, 5, LocalDateTime.now().plusDays(2), List.of()),
            new Task("3", "C", 3, 5, LocalDateTime.now().plusDays(3), List.of("1", "2"))
        );

        int critical = CriticalPathEngine.calculate(tasks);
        // max(5, 7) = 7, then + 3 = 10
        assertEquals(10, critical);
    }
}
