package com.enterprise.taskmanager;

import com.enterprise.taskmanager.core.PriorityEngine;
import com.enterprise.taskmanager.core.Task;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for PriorityEngine.
 * No side effects, no state dependencies.
 */
public class PriorityEngineTest {

    @Test
    void shouldClassifyTasksIntoMatrix() {
        Task urgentImportant = new Task(
            "1",
            "Critical Bug",
            2,
            9,
            LocalDateTime.now().minusDays(1),
            List.of()
        );

        Task notUrgentImportant = new Task(
            "2",
            "Feature Enhancement",
            5,
            8,
            LocalDateTime.now().plusDays(10),
            List.of()
        );

        Task urgentNotImportant = new Task(
            "3",
            "Email Response",
            1,
            3,
            LocalDateTime.now().minusDays(1),
            List.of()
        );

        Task notUrgentNotImportant = new Task(
            "4",
            "Office Cleaning",
            3,
            2,
            LocalDateTime.now().plusDays(30),
            List.of()
        );

        List<Task> tasks = List.of(
            urgentImportant,
            notUrgentImportant,
            urgentNotImportant,
            notUrgentNotImportant
        );

        @SuppressWarnings("unchecked")
        List<Task>[][] matrix = PriorityEngine.classify(tasks);

        // Verify matrix dimensions
        assertEquals(2, matrix.length);
        assertEquals(2, matrix[0].length);

        // Verify classification
        assertEquals(1, matrix[1][1].size()); // Urgent + Important
        assertEquals(1, matrix[0][1].size()); // Not Urgent + Important
        assertEquals(1, matrix[1][0].size()); // Urgent + Not Important
        assertEquals(1, matrix[0][0].size()); // Not Urgent + Not Important
    }

    @Test
    void shouldCalculatePriorityScore() {
        Task task = new Task(
            "1",
            "Test",
            5,
            8,
            LocalDateTime.now().minusDays(1),
            List.of()
        );

        int score = PriorityEngine.calculatePriorityScore(task);
        // Score = (1 * 10) + (1 * 5) + 8 = 23
        assertEquals(23, score);
    }

    @Test
    void shouldIdentifyOverdueTasks() {
        Task overdue = new Task(
            "1",
            "Late",
            3,
            7,
            LocalDateTime.now().minusDays(5),
            List.of()
        );

        Task onTime = new Task(
            "2",
            "On Time",
            3,
            7,
            LocalDateTime.now().plusDays(5),
            List.of()
        );

        assertTrue(overdue.isOverdue());
        assertFalse(onTime.isOverdue());
    }

    @Test
    void shouldHandleEmptyTaskList() {
        @SuppressWarnings("unchecked")
        List<Task>[][] matrix = PriorityEngine.classify(List.of());

        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                assertTrue(matrix[i][j].isEmpty());
            }
        }
    }

    @Test
    void shouldGetQuadrantNames() {
        assertEquals("DELEGATE (Not Urgent, Not Important)", PriorityEngine.getQuadrantName(0, 0));
        assertEquals("PLAN (Not Urgent, Important)", PriorityEngine.getQuadrantName(0, 1));
        assertEquals("INTERRUPT (Urgent, Not Important)", PriorityEngine.getQuadrantName(1, 0));
        assertEquals("DO_FIRST (Urgent, Important)", PriorityEngine.getQuadrantName(1, 1));
    }
}
