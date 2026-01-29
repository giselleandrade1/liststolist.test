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
 * Lists all tasks classified by Eisenhower Priority Matrix.
 * 
 * Architecture: Stateless, demonstrating PriorityEngine classification
 */
public class list {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // CORS Headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(req.getMethod())) {
            res.setStatus(204);
            return;
        }

        // Sample demonstration data (stateless simulation)
        // In production: fetch from database/cache
        List<Task> tasks = List.of(
            new Task("1", "Estudar Java Avançado", 4, 9, 
                LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "Refatorar Arquitetura", 3, 6, 
                LocalDateTime.now().plusDays(3), List.of()),
            new Task("3", "Code Review Urgente", 2, 8, 
                LocalDateTime.now().minusDays(1), List.of()),
            new Task("4", "Atualizar Documentação", 5, 4, 
                LocalDateTime.now().plusDays(7), List.of()),
            new Task("5", "Deploy na Vercel", 2, 9,
                LocalDateTime.now().minusHours(2), List.of("1", "2"))
        );

        // Use PriorityEngine to classify (core business logic)
        @SuppressWarnings("unchecked")
        List<Task>[][] matrix = PriorityEngine.classify(tasks);

        // Build structured JSON response
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append("  \"total\": ").append(tasks.size()).append(",\n");
        json.append("  \"timestamp\": \"").append(LocalDateTime.now()).append("\",\n");
        json.append("  \"matrix\": {\n");

        boolean firstQuadrant = true;
        for (int urgency = 0; urgency < 2; urgency++) {
            for (int importance = 0; importance < 2; importance++) {
                if (!firstQuadrant) json.append(",\n");
                firstQuadrant = false;

                String quadrant = PriorityEngine.getQuadrantName(urgency, importance);
                List<Task> quadrantTasks = matrix[urgency][importance];
                
                json.append("    \"").append(quadrant).append("\": {\n");
                json.append("      \"count\": ").append(quadrantTasks.size()).append(",\n");
                json.append("      \"tasks\": [\n");

                for (int i = 0; i < quadrantTasks.size(); i++) {
                    Task t = quadrantTasks.get(i);
                    int score = PriorityEngine.calculatePriorityScore(t);
                    
                    json.append("        {\n");
                    json.append("          \"id\": \"").append(t.id).append("\",\n");
                    json.append("          \"title\": \"").append(t.title).append("\",\n");
                    json.append("          \"priority\": ").append(t.priority).append(",\n");
                    json.append("          \"priorityScore\": ").append(score).append(",\n");
                    json.append("          \"estimatedTime\": ").append(t.estimatedTime).append(",\n");
                    json.append("          \"overdue\": ").append(t.isOverdue()).append("\n");
                    json.append("        }");
                    if (i < quadrantTasks.size() - 1) json.append(",");
                    json.append("\n");
                }
                
                json.append("      ]\n");
                json.append("    }");
            }
        }

        json.append("\n  }\n");
        json.append("}");

        res.setStatus(200);
        res.setContentType("application/json; charset=UTF-8");
        res.getWriter().write(json.toString());
    }
}
