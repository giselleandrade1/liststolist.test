package api.tasks;

import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.core.PriorityEngine;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Serverless Function: POST /api/tasks/create
 * Creates a new task and returns its ID.
 * 
 * Architecture: Stateless, Cloud-Native, Vercel Compatible
 */
public class create {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // CORS Headers for frontend
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // Handle preflight
        if ("OPTIONS".equals(req.getMethod())) {
            res.setStatus(204);
            return;
        }

        // Parse request parameters
        String title = req.getParameter("title");
        String estimatedTimeStr = req.getParameter("estimatedTime");
        String priorityStr = req.getParameter("priority");

        int estimatedTime = estimatedTimeStr != null ? Integer.parseInt(estimatedTimeStr) : 5;
        int priority = priorityStr != null ? Integer.parseInt(priorityStr) : 5;

        // Create task using core logic (100% stateless)
        Task task = new Task(
            UUID.randomUUID().toString(),
            title != null && !title.isBlank() ? title : "Nova Tarefa",
            estimatedTime,
            priority,
            LocalDateTime.now().plusDays(2),
            List.of()
        );

        // Calculate priority score using PriorityEngine
        int score = PriorityEngine.calculatePriorityScore(task);

        // Get classification quadrant
        boolean urgent = task.isOverdue() || task.dueDate.isBefore(LocalDateTime.now().plusDays(1));
        boolean important = task.priority >= 7;
        String quadrant = PriorityEngine.getQuadrantName(urgent ? 1 : 0, important ? 1 : 0);

        // Build JSON response
        res.setStatus(201);
        res.setContentType("application/json; charset=UTF-8");
        res.getWriter().write(String.format("""
            {
              "id": "%s",
              "title": "%s",
              "estimatedTime": %d,
              "priority": %d,
              "priorityScore": %d,
              "quadrant": "%s",
              "dueDate": "%s",
              "status": "created",
              "timestamp": "%s"
            }
            """,
            task.id,
            task.title,
            task.estimatedTime,
            task.priority,
            score,
            quadrant,
            task.dueDate.toString(),
            LocalDateTime.now().toString()
        ));
    }
}
            """, task.id, task.title, task.priority, score));
    }
}
