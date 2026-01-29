import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.core.PriorityEngine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Serverless Function: GET /api/tasks/list
 * Lists all tasks classified by priority matrix.
 */
public class ListTasks {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // Sample data (in real app, would fetch from database)
        List<Task> tasks = List.of(
            new Task("1", "Estudar Java", 4, 9, LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "Refatorar projeto", 3, 6, LocalDateTime.now().plusDays(3), List.of()),
            new Task("3", "Revisar código", 2, 8, LocalDateTime.now().minusDays(1), List.of()),
            new Task("4", "Documentação", 5, 4, LocalDateTime.now().plusDays(7), List.of())
        );

        // Classify using stateless core logic
        @SuppressWarnings("unchecked")
        List<Task>[][] matrix = PriorityEngine.classify(tasks);

        // Build response JSON
        StringBuilder json = new StringBuilder("""
            {
              "total": %d,
              "matrix": {
            """.formatted(tasks.size()));

        for (int urgency = 0; urgency < 2; urgency++) {
            for (int importance = 0; importance < 2; importance++) {
                String quadrant = PriorityEngine.getQuadrantName(urgency, importance);
                int count = matrix[urgency][importance].size();
                
                json.append(String.format("""
                    "%s": {
                      "count": %d,
                      "tasks": [
                    """, quadrant, count));

                List<Task> quadrantTasks = matrix[urgency][importance];
                for (int i = 0; i < quadrantTasks.size(); i++) {
                    Task t = quadrantTasks.get(i);
                    json.append(String.format("""
                        {"id": "%s", "title": "%s", "priority": %d}
                        """, t.id, t.title, t.priority));
                    if (i < quadrantTasks.size() - 1) json.append(",");
                }
                json.append("]},");
            }
        }

        // Remove trailing comma and close JSON
        if (json.charAt(json.length() - 1) == ',') {
            json.setLength(json.length() - 1);
        }
        json.append("}");

        res.setStatus(200);
        res.setContentType("application/json");
        res.getWriter().write(json.toString());
    }
}
