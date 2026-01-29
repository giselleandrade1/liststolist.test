import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.core.PriorityEngine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Serverless Function: POST /api/tasks/create
 * Creates a new task and returns its ID.
 */
public class Create {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // Parse request body (simplified - real implementation would parse JSON)
        String title = req.getParameter("title");
        int estimatedTime = Integer.parseInt(req.getParameter("estimatedTime") != null 
            ? req.getParameter("estimatedTime") : "5");
        int priority = Integer.parseInt(req.getParameter("priority") != null 
            ? req.getParameter("priority") : "5");

        // Create task (stateless - no side effects)
        Task task = new Task(
            UUID.randomUUID().toString(),
            title != null ? title : "New Task",
            estimatedTime,
            priority,
            LocalDateTime.now().plusDays(2),
            List.of()
        );

        // Calculate priority score using core logic
        int score = PriorityEngine.calculatePriorityScore(task);

        // HTTP Response
        res.setStatus(201); // Created
        res.setContentType("application/json");
        res.getWriter().write(String.format("""
            {
              "id": "%s",
              "title": "%s",
              "priority": %d,
              "priorityScore": %d,
              "status": "created"
            }
            """, task.id, task.title, task.priority, score));
    }
}
