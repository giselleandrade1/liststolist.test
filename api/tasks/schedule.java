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
 * 100% Stateless - calculates Critical Path and PERT estimates
 */
public class schedule {

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

        // Simulated project data (stateless)
        List<Task> tasks = List.of(
            new Task("A", "Setup Infrastructure", 2, 8, 
                LocalDateTime.now().plusDays(1), List.of()),
            new Task("B", "Implement Core", 5, 9, 
                LocalDateTime.now().plusDays(2), List.of("A")),
            new Task("C", "Unit Tests", 3, 7, 
                LocalDateTime.now().plusDays(3), List.of("B")),
            new Task("D", "Integration Tests", 4, 8, 
                LocalDateTime.now().plusDays(4), List.of("B")),
            new Task("E", "Deploy", 2, 9, 
                LocalDateTime.now().plusDays(5), List.of("C", "D"))
        );

        // Pure function calls
        int criticalPath = CriticalPathEngine.calculate(tasks);
        double pertOptimistic = CriticalPathEngine.pertEstimate(10, 16, 28);
        double pertRealistic = CriticalPathEngine.pertEstimate(14, 16, 22);
        double pertPessimistic = CriticalPathEngine.pertEstimate(16, 20, 30);

        // Manual JSON
        String json = String.format(
            "{\n" +
            "  \"criticalPath\": %d,\n" +
            "  \"pert\": {\n" +
            "    \"optimistic\": %.2f,\n" +
            "    \"realistic\": %.2f,\n" +
            "    \"pessimistic\": %.2f\n" +
            "  },\n" +
            "  \"tasks\": %d,\n" +
            "  \"message\": \"Critical path computed successfully\"\n" +
            "}",
            criticalPath, pertOptimistic, pertRealistic, pertPessimistic, tasks.size()
        );

        res.setStatus(200);
        res.setContentType("application/json; charset=UTF-8");
        res.getWriter().write(json);
    }
}

        res.setStatus(200);
        res.setContentType("application/json; charset=UTF-8");
        res.getWriter().write(json.toString());
    }
}
