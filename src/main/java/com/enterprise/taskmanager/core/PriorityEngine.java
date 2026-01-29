package com.enterprise.taskmanager.core;

import java.util.ArrayList;
import java.util.List;

/**
 * Stateless Priority Engine using Eisenhower Matrix (Urgent/Important).
 * No internal state. All state is passed in and returned.
 * 
 * Matrix positions:
 * [0][0] = Not Urgent, Not Important (Low priority)
 * [0][1] = Not Urgent, Important (Plan)
 * [1][0] = Urgent, Not Important (Delegate)
 * [1][1] = Urgent, Important (Do First)
 */
public final class PriorityEngine {

    private PriorityEngine() {
        // Utility class - no instantiation
    }

    /**
     * Classifies tasks into Eisenhower Matrix.
     * Pure function: no side effects, deterministic.
     * 
     * @param tasks input task list
     * @return 2x2 matrix of classified tasks
     */
    @SuppressWarnings("unchecked")
    public static List<Task>[][] classify(List<Task> tasks) {
        List<Task>[][] matrix = new ArrayList[2][2];

        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                matrix[i][j] = new ArrayList<>();
            }
        }

        for (Task task : tasks) {
            int urgency = task.getUrgency();
            int importance = task.getImportance();
            matrix[urgency][importance].add(task);
        }

        return matrix;
    }

    /**
     * Gets the quadrant name for debugging/logging.
     */
    public static String getQuadrantName(int urgency, int importance) {
        return switch (urgency * 2 + importance) {
            case 0 -> "DELEGATE (Not Urgent, Not Important)";
            case 1 -> "PLAN (Not Urgent, Important)";
            case 2 -> "INTERRUPT (Urgent, Not Important)";
            case 3 -> "DO_FIRST (Urgent, Important)";
            default -> "UNKNOWN";
        };
    }

    /**
     * Calculates priority score for ranking.
     * Score = (importance * 10) + (urgency * 5) + (priority value)
     */
    public static int calculatePriorityScore(Task task) {
        return (task.getImportance() * 10) + (task.getUrgency() * 5) + task.priority;
    }
}
