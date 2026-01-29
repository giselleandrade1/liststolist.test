package api.tasks;

import com.enterprise.taskmanager.core.Task;
import com.enterprise.taskmanager.scheduling.CriticalPathEngine;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Serverless Function: POST /api/tasks/schedule
 * Calculates critical path and PERT estimates for project scheduling.
 * 
 * Architecture: Demonstrates advanced scheduling algorithms in stateless context
 */
public class schedule {

    public static void handle(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        // CORS Headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(req.getMethod())) {
            res.setStatus(204);
            return;
        }

        // Simulation: Project with dependencies (stateless)
        // In production: receive from request body
        List<Task> projectTasks = List.of(
            new Task("1", "Análise de Requisitos", 5, 8, 
                LocalDateTime.now().plusDays(1), List.of()),
            new Task("2", "Design da Arquitetura", 8, 9, 
                LocalDateTime.now().plusDays(2), List.of("1")),
            new Task("3", "Implementação Core", 10, 9, 
                LocalDateTime.now().plusDays(3), List.of("2")),
            new Task("4", "Testes Unitários", 4, 7, 
                LocalDateTime.now().plusDays(4), List.of("3")),
            new Task("5", "Integração", 3, 8, 
                LocalDateTime.now().plusDays(5), List.of("3")),
            new Task("6", "Deploy", 2, 9, 
                LocalDateTime.now().plusDays(6), List.of("4", "5"))
        );

        // Calculate critical path using CriticalPathEngine
        int criticalPathTime = CriticalPathEngine.calculate(projectTasks);
        List<String> criticalPath = CriticalPathEngine.getCriticalPath(projectTasks);

        // PERT estimates (Three-Point Estimation)
        double pertOptimistic = CriticalPathEngine.pertEstimate(2, 4, 8);   // Best case
        double pertRealistic = CriticalPathEngine.pertEstimate(4, 6, 10);   // Likely
        double pertPessimistic = CriticalPathEngine.pertEstimate(8, 12, 20); // Worst case

        // Build structured JSON response
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append("  \"projectSummary\": {\n");
        json.append("    \"totalTasks\": ").append(projectTasks.size()).append(",\n");
        json.append("    \"criticalPathTime\": ").append(criticalPathTime).append(",\n");
        json.append("    \"timestamp\": \"").append(LocalDateTime.now()).append("\"\n");
        json.append("  },\n");
        
        json.append("  \"criticalPath\": [\n");
        for (int i = 0; i < criticalPath.size(); i++) {
            json.append("    \"").append(criticalPath.get(i)).append("\"");
            if (i < criticalPath.size() - 1) json.append(",");
            json.append("\n");
        }
        json.append("  ],\n");

        json.append("  \"pertEstimates\": {\n");
        json.append("    \"optimistic\": ").append(String.format("%.2f", pertOptimistic)).append(",\n");
        json.append("    \"realistic\": ").append(String.format("%.2f", pertRealistic)).append(",\n");
        json.append("    \"pessimistic\": ").append(String.format("%.2f", pertPessimistic)).append("\n");
        json.append("  },\n");

        json.append("  \"tasks\": [\n");
        for (int i = 0; i < projectTasks.size(); i++) {
            Task t = projectTasks.get(i);
            json.append("    {\n");
            json.append("      \"id\": \"").append(t.id).append("\",\n");
            json.append("      \"title\": \"").append(t.title).append("\",\n");
            json.append("      \"estimatedTime\": ").append(t.estimatedTime).append(",\n");
            json.append("      \"dependencies\": ").append(t.dependencies.size()).append(",\n");
            json.append("      \"onCriticalPath\": ").append(criticalPath.contains(t.id)).append("\n");
            json.append("    }");
            if (i < projectTasks.size() - 1) json.append(",");
            json.append("\n");
        }
        json.append("  ]\n");
        json.append("}");

        res.setStatus(200);
        res.setContentType("application/json; charset=UTF-8");
        res.getWriter().write(json.toString());
    }
}
