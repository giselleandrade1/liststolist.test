package com.enterprise.taskmanager.core;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Immutable Task representation.
 * Zero mutable state - everything is final.
 * Cloud-native compatible.
 */
public final class Task {

    public final String id;
    public final String title;
    public final int estimatedTime;
    public final int priority;
    public final LocalDateTime dueDate;
    public final List<String> dependencies;

    public Task(
        String id,
        String title,
        int estimatedTime,
        int priority,
        LocalDateTime dueDate,
        List<String> dependencies
    ) {
        this.id = id;
        this.title = title;
        this.estimatedTime = estimatedTime;
        this.priority = priority;
        this.dueDate = dueDate;
        this.dependencies = dependencies;
    }

    /**
     * Convenience constructor for simple cases.
     */
    public Task(String id, String title) {
        this(id, title, 0, 5, LocalDateTime.now().plusDays(1), List.of());
    }

    /**
     * Determines if this task is past its due date.
     */
    public boolean isOverdue() {
        return dueDate.isBefore(LocalDateTime.now());
    }

    /**
     * Determines urgency: high (1) if overdue, low (0) otherwise.
     */
    public int getUrgency() {
        return isOverdue() ? 1 : 0;
    }

    /**
     * Determines importance: high (1) if priority > 7, low (0) otherwise.
     */
    public int getImportance() {
        return priority > 7 ? 1 : 0;
    }

    @Override
    public String toString() {
        return "Task{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", priority=" + priority +
                '}';
    }
}
