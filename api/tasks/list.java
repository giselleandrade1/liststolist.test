package api.tasks;

import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.core.PriorityEngine;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Serverless Function: GET /api/tasks/list
 * 100% Stateless - demonstrates Eisenhower Matrix classification
 */
public class list {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(req.getMethod())) {
            res.setStatus(204);
            return;
        }

        // Simulated data (stateless - in production: fetch from DB)
        List<Task> tasks = List.of(
            new Task("1", "Estudar Java Avançado", 4, 9, 
                LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "Refatorar Core", 3, 6, 
                LocalDateTime.now().plusDays(3), List.of()),
            new Task("3", "Code Review Crítico", 2, 8, 
                LocalDateTime.now().minusDays(1), List.of()),
            new Task("4", "Documentar API", 5, 4, 
                LocalDateTime.now().plusDays(7), List.of()),
            new Task("5", "Deploy Vercel", 2, 9,
                LocalDateTime.now().minusHours(2), List.of("1"))
        );

        // Pure function: classify tasks
        List<Task>[][] matrix = PriorityEngine.classify(tasks);

        // Manual JSON (no framework needed)
        StringBuilder json = new StringBuilder();
        json.append("{\n  \"total\": ").append(tasks.size());
        json.append(",\n  \"matrix\": {\n");

        boolean first = true;
        for (int urgency = 0; urgency < 2; urgency++) {
            for (int importance = 0; importance < 2; importance++) {
                if (!first) json.append(",\n");
                first = false;

                String quadrant = PriorityEngine.getQuadrantName(urgency, importance);
                List<Task> quadrantTasks = matrix[urgency][importance];
                
                json.append("    \"").append(quadrant).append("\": {\n");
                json.append("      \"count\": ").append(quadrantTasks.size()).append(",\n");
                json.append("      \"tasks\": [");

                for (int i = 0; i < quadrantTasks.size(); i++) {
                    Task t = quadrantTasks.get(i);
                    if (i > 0) json.append(",");
                    json.append("\n        {");
                    json.append("\"id\":\"").append(t.id).append("\",");
                    json.append("\"title\":\"").append(t.title).append("\",");
                    json.append("\"priority\":").append(t.priority);
                    json.append("}");
                }
                
                json.append("\n      ]\n    }");
            }
        }

        json.append("\n  }\n}");

        res.setStatus(200);
        res.setContentType("application/json; charset=UTF-8");
        res.getWriter().write(json.toString());
    }
}
