# 🏗️ Arquitetura Técnica - LembraFácil

## Visão Geral

Este documento detalha as decisões arquiteturais do projeto **LembraFácil**, um gerenciador de tarefas serverless com foco em **Clean Architecture**, **stateless design** e **acessibilidade universal**.

---

## Princípios Fundamentais

### 1. Stateless Core (100%)
**Decisão:** Todo o core business é completamente stateless.

**Implementação:**
- `Task.java`: Todos os campos são `final`, nenhum setter
- `PriorityEngine.java`: Utility class com construtor privado, apenas métodos estáticos
- `CriticalPathEngine.java`: Cria novas estruturas de dados a cada chamada

**Benefícios:**
- ✅ Thread-safe por design
- ✅ Fácil de testar (pure functions)
- ✅ Serverless-friendly (sem estado compartilhado entre invocações)
- ✅ Escalabilidade horizontal sem limitações

### 2. Immutability First
**Decisão:** Objetos de domínio são imutáveis.

```java
public class Task {
    public final String id;
    public final String title;
    public final int estimatedTime;
    // ... todos os campos são final
}
```

**Benefícios:**
- ✅ Evita bugs relacionados a mutação inesperada
- ✅ Facilita raciocínio sobre o código
- ✅ Compatível com programação funcional

### 3. Dependency Inversion
**Decisão:** Core não conhece frameworks externos.

```
Core (Domain) ──▶ não depende de nada
     ▲
     │
API Layer ──▶ depende do Core
```

**Benefícios:**
- ✅ Testabilidade: pode testar o core sem infraestrutura
- ✅ Flexibilidade: trocar framework sem afetar regras de negócio
- ✅ Longevidade: core sobrevive a mudanças de tecnologia

### 4. Separation of Concerns
**Camadas:**

1. **Presentation (Frontend)**
   - Responsabilidade: UI/UX, acessibilidade, persistência local
   - Tecnologia: Vanilla JS, CSS3, Service Worker
   - Comunicação: HTTP REST com API

2. **Application (API)**
   - Responsabilidade: HTTP handling, serialização JSON, CORS
   - Tecnologia: Java Servlet API, Vercel Functions
   - Comunicação: Chama métodos do Core

3. **Domain (Core)**
   - Responsabilidade: Regras de negócio puras
   - Tecnologia: Java 17 puro (sem libs externas)
   - Comunicação: Não sabe de HTTP/JSON

---

## Decisões Técnicas

### Por que Java em Serverless?

**Contexto:** Demonstrar habilidades avançadas em Java enterprise.

**Alternativas consideradas:**
- Node.js: Mais comum em serverless, mas não demonstra Java
- Python: Também popular, mas foco era Java
- Go: Performático, mas menos enterprise

**Decisão:** Java 17 com Vercel Java Runtime

**Trade-offs:**
- ➖ Cold start ~500ms (vs ~100ms Node.js)
- ➕ Type safety compilado
- ➕ Ecossistema enterprise robusto
- ➕ Demonstra arquitetura avançada

### Por que Vanilla JS no Frontend?

**Contexto:** Maximizar acessibilidade e performance.

**Alternativas consideradas:**
- React: Overhead de bundle (~40KB min+gzip)
- Vue: Também adiciona complexidade
- Svelte: Melhor, mas adiciona build step

**Decisão:** Vanilla JavaScript (~450 linhas)

**Trade-offs:**
- ➕ Zero dependências, 100% controle
- ➕ Menor bundle possível
- ➕ Acessibilidade total (sem camadas de abstração)
- ➖ Mais código manual para gerenciar estado

### Por que Manual JSON Serialization?

**Contexto:** Simplicidade vs. framework overhead.

**Alternativas consideradas:**
- Jackson: Popular, mas adiciona 1MB+ de dependências
- Gson: Menor, mas ainda overhead
- JSON-B: Standard, mas complexo para casos simples

**Decisão:** String.format() e StringBuilder manual

**Trade-offs:**
- ➕ Zero dependências externas
- ➕ Controle total sobre output
- ➕ Mais rápido (sem reflexão)
- ➖ Mais verboso
- ➖ Sem validação automática

**Exemplo:**
```java
String json = String.format(
    "{\"id\":\"%s\",\"priority\":%d}",
    task.id, task.priority
);
```

---

## Algoritmos Implementados

### 1. Eisenhower Matrix (PriorityEngine)
**Complexidade:** O(n) onde n = número de tarefas

**Algoritmo:**
1. Para cada tarefa, calcula urgência (1-9) baseada em deadline
2. Calcula importância (1-9) baseada em tempo estimado
3. Classifica em quadrante: (urgency < 5, importance < 5)
4. Retorna matriz 2×2 com List<Task>[][]

**Por que este algoritmo?**
- Método comprovado de priorização (usado por Eisenhower)
- Simples de explicar para usuários não-técnicos
- Escalável: O(n) é aceitável até milhões de tarefas

### 2. Critical Path Method (CriticalPathEngine)
**Complexidade:** O(n²) pior caso, O(n) caso médio

**Algoritmo:**
1. Primeira passagem: processa tarefas sem dependências
2. Loop iterativo: resolve dependências gradualmente
3. Retorna duração do caminho mais longo

**Por que este algoritmo?**
- Standard da indústria para project management
- Encontra bottlenecks automaticamente
- Útil para estimativas realistas

### 3. PERT (Three-Point Estimation)
**Complexidade:** O(1)

**Fórmula:** `(optimistic + 4×likely + pessimistic) / 6`

**Por que este algoritmo?**
- Considera incerteza (melhor que média simples)
- Baseado em distribuição Beta
- Usado em NASA, Boeing, etc.

---

## Padrões Aplicados

### 1. Factory Pattern
**Onde:** Criação de Tasks

```java
Task task = new Task(
    UUID.randomUUID().toString(),
    title,
    estimatedTime,
    urgency,
    importance,
    deadline,
    dependencies
);
```

### 2. Strategy Pattern (implícito)
**Onde:** Diferentes algoritmos de classificação

```java
// Estratégia 1: Eisenhower Matrix
List<Task>[][] matrix = PriorityEngine.classify(tasks);

// Estratégia 2: Critical Path
int duration = CriticalPathEngine.calculate(tasks);
```

### 3. Repository Pattern (Frontend)
**Onde:** MultiLayerPersistence

```java
class MultiLayerPersistence {
    saveTasks(tasks) {
        this.memoryCache = tasks;          // L1 cache
        localStorage.setItem('tasks', ...); // L2 persistent
    }
}
```

### 4. Command Pattern (Frontend)
**Onde:** Ações do usuário

```java
handleAddTask() {
    const command = new AddTaskCommand(title);
    command.execute();
    this.render();
}
```

---

## Testes

### Estratégia de Testes
**Foco:** 100% coverage do Core business logic

**Níveis:**
1. **Unit Tests**: Todas as funções do Core
   - PriorityEngineTest: 5 casos
   - CriticalPathEngineTest: 6 casos
   
2. **Integration Tests**: (não implementado ainda)
   - Endpoints API completos
   - Frontend + Backend

3. **E2E Tests**: (não implementado)
   - Fluxos completos de usuário

**Por que apenas Unit no Core?**
- Core é o coração do negócio (mais crítico)
- Pure functions são fáceis de testar
- API é thin wrapper (menos crítico)

---

## Performance

### Métricas Esperadas

| Métrica | Valor | Contexto |
|---------|-------|----------|
| Frontend Load | < 1s | First Contentful Paint |
| API Cold Start | ~500ms | Java JVM warmup |
| API Warm | ~50ms | Request já quente |
| Classify 1000 tasks | ~10ms | O(n) linear |
| Critical Path 100 tasks | ~5ms | O(n) médio caso |

### Otimizações Aplicadas

1. **Frontend**
   - Service Worker: cache-first strategy
   - No frameworks: bundle mínimo
   - CSS Custom Properties: uma única fonte de verdade

2. **Backend**
   - Stateless: sem overhead de sincronização
   - Manual JSON: sem reflexão
   - Pure functions: JIT pode otimizar agressivamente

---

## Segurança

### Implementado
- ✅ CORS headers em todos os endpoints
- ✅ Input sanitization (frontend)
- ✅ Content-Type validation

### Pendente (Produção)
- ⚠️ Rate limiting
- ⚠️ Authentication/Authorization (JWT)
- ⚠️ Input validation backend (reject malformed JSON)
- ⚠️ HTTPS only

---

## Escalabilidade

### Horizontal Scaling
**Serverless = ∞ instâncias paralelas**

Como isso funciona:
1. Vercel automaticamente spawna Functions sob demanda
2. Como Core é 100% stateless, não há sincronização
3. Cada request é independente

**Limite teórico:** Network I/O (não CPU/Memory)

### Vertical Scaling
**Não aplicável** (serverless abstrai isso)

---

## Observabilidade

### Logging (Sugerido)
```java
// Em produção, adicionar:
logger.info("Task created", Map.of(
    "taskId", task.id,
    "priority", task.priority
));
```

### Metrics (Sugerido)
- Tempo médio de classificação
- Distribuição de tarefas por quadrante
- Taxa de erro nos endpoints

### Tracing (Sugerido)
- OpenTelemetry para rastrear requests
- Identificar bottlenecks em dependencies

---

## Evolução Futura

### Roadmap Técnico

1. **Persistence Real**
   - PostgreSQL para tarefas
   - Redis para cache
   - Migração: localStorage → DB

2. **Authentication**
   - Auth0/Clerk para login
   - Multi-tenant: tasks separadas por usuário

3. **Real-time Updates**
   - WebSockets ou Server-Sent Events
   - Sincronização entre dispositivos

4. **Advanced Analytics**
   - Time tracking
   - Productivity insights
   - Burndown charts

5. **Mobile Apps**
   - React Native ou Flutter
   - Compartilha backend serverless

---

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Serverless Architectures - AWS](https://aws.amazon.com/serverless/)
- [Critical Path Method - PMI](https://www.pmi.org/)

---

**Última Atualização:** 2026-01-29  
**Versão:** 1.0.0
