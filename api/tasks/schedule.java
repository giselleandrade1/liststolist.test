import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.scheduling.CriticalPathEngine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Serverless Function: POST /api/tasks/schedule
 * Calculates critical path and PERT estimates for project scheduling.
 */
public class Schedule {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // Sample tasks with dependencies
        List<Task> tasks = List.of(
            new Task("1", "Design", 5, 8, LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "Implementation", 3, 9, LocalDateTime.now().plusDays(2), List.of("1")),
            new Task("3", "Testing", 2, 7, LocalDateTime.now().plusDays(3), List.of("2")),
            new Task("4", "Deployment", 1, 8, LocalDateTime.now().plusDays(4), List.of("3"))
        );

        // Calculate critical path (stateless core logic)
        int criticalTime = CriticalPathEngine.calculate(tasks);
        List<String> criticalTasks = CriticalPathEngine.getCriticalPath(tasks);

        // PERT estimate: (optimistic=2, likely=4, pessimistic=8)
        double pertEstimate = CriticalPathEngine.pertEstimate(2, 4, 8);

        // Build response
        StringBuilder json = new StringBuilder(String.format("""
            {
              "criticalPathTime": %d,
              "criticalTasks": [
            """, criticalTime));

        for (int i = 0; i < criticalTasks.size(); i++) {
            json.append("\"").append(criticalTasks.get(i)).append("\"");
            if (i < criticalTasks.size() - 1) json.append(",");
        }

        json.append(String.format("""
            ],
              "pertEstimate": %.2f,
              "totalTasks": %d
            }
            """, pertEstimate, tasks.size()));

        res.setStatus(200);
        res.setContentType("application/json");
        res.getWriter().write(json.toString());
    }
}
