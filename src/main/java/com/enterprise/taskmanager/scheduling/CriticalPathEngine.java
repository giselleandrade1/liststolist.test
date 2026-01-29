package com.enterprise.taskmanager.scheduling;

import com.enterprise.taskmanager.core.Task;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Critical Path Engine: calculates longest dependency chain.
 * Used for project scheduling and bottleneck identification.
 * Stateless - all state passed as parameters.
 */
public final class CriticalPathEngine {

    private CriticalPathEngine() {
        // Utility class
    }

    /**
     * Calculates the critical path duration (longest dependency chain).
     * If a task depends on others, its start time = max(dependencies end time).
     * 
     * @param tasks input list
     * @return total duration in hours
     */
    public static int calculate(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return 0;
        }

        Map<String, Integer> taskDurations = new HashMap<>();
        Map<String, Integer> taskEndTimes = new HashMap<>();

        // First pass: all tasks with no dependencies
        for (Task task : tasks) {
            if (task.dependencies.isEmpty()) {
                taskDurations.put(task.id, task.estimatedTime);
                taskEndTimes.put(task.id, task.estimatedTime);
            }
        }

        // Iterative pass: resolve dependencies
        boolean changed = true;
        int iterations = 0;
        int maxIterations = tasks.size();

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            for (Task task : tasks) {
                if (!taskEndTimes.containsKey(task.id) && !task.dependencies.isEmpty()) {
                    int maxDependencyEnd = 0;
                    boolean allDependenciesResolved = true;

                    for (String depId : task.dependencies) {
                        if (taskEndTimes.containsKey(depId)) {
                            maxDependencyEnd = Math.max(maxDependencyEnd, taskEndTimes.get(depId));
                        } else {
                            allDependenciesResolved = false;
                            break;
                        }
                    }

                    if (allDependenciesResolved) {
                        int endTime = maxDependencyEnd + task.estimatedTime;
                        taskDurations.put(task.id, task.estimatedTime);
                        taskEndTimes.put(task.id, endTime);
                        changed = true;
                    }
                }
            }
        }

        return taskEndTimes.values().stream()
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);
    }

    /**
     * Identifies critical tasks (those on the critical path).
     */
    public static List<String> getCriticalPath(List<Task> tasks) {
        int criticalDuration = calculate(tasks);
        
        // Tasks whose end time equals critical duration are critical
        return tasks.stream()
                .filter(t -> t.estimatedTime == criticalDuration)
                .map(t -> t.id)
                .toList();
    }

    /**
     * PERT (Program Evaluation Review Technique) estimate.
     * Formula: (optimistic + 4*most_likely + pessimistic) / 6
     */
    public static double pertEstimate(int optimistic, int mostLikely, int pessimistic) {
        return (optimistic + (4.0 * mostLikely) + pessimistic) / 6.0;
    }
}
