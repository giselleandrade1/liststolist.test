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
 * 100% Stateless - compatible with Vercel Functions
 */
public class create {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(req.getMethod())) {
            res.setStatus(204);
            return;
        }

        // Parse parameters (stateless)
        String title = req.getParameter("title");
        String estimatedTimeStr = req.getParameter("estimatedTime");
        String priorityStr = req.getParameter("priority");

        int estimatedTime = estimatedTimeStr != null ? 
            Integer.parseInt(estimatedTimeStr) : 5;
        int priority = priorityStr != null ? 
            Integer.parseInt(priorityStr) : 5;

        // Create immutable task
        Task task = new Task(
            UUID.randomUUID().toString(),
            title != null && !title.isBlank() ? title : "Nova Tarefa",
            estimatedTime,
            priority,
            LocalDateTime.now().plusDays(2),
            List.of()
        );

        // Use core logic (pure function)
        int score = PriorityEngine.calculatePriorityScore(task);
        String quadrant = PriorityEngine.getQuadrantName(
            task.getUrgency(), 
            task.getImportance()
        );

        // JSON response (manual - no Jackson needed)
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
            LocalDateTime.now().toString()
        ));
    }
}
            """, task.id, task.title, task.priority, score));
    }
}
