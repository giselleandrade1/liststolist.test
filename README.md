# Task Manager Avançado – Java Serverless

Olá! Sou a Giselle e desenvolvi este sistema de gerenciamento de tarefas em **Java puro**, com arquitetura stateless e pronto para rodar serverless na Vercel.

Aqui demonstro conceitos de engenharia de software de nível avançado: Clean Architecture, algoritmos complexos e padrões modernos de deployment em cloud.

---

## 🏗️ Arquitetura

```
Task Manager (Java Serverless)
├── Camada Core (100% Stateless)
│   ├── Task – Modelo de dados imutável
│   ├── PriorityEngine – Classificação via Matriz de Eisenhower
│   └── CriticalPathEngine – Algoritmos de agendamento de projetos
│
└── Camada API (Vercel Serverless Functions)
    ├── POST /api/tasks/create
    ├── GET /api/tasks/list
    └── POST /api/tasks/schedule
```

### Por que Stateless?

- ✅ **Compatível com Serverless** – As execuções são efêmeras
- ✅ **Escalável** – Sem estado de sessão para sincronizar
- ✅ **Determinístico** – Funções puras, mesma entrada = mesma saída
- ✅ **Cloud-Native** – Respeita as limitações da plataforma Vercel
- ✅ **Padrão Enterprise** – Separação clara entre core e infraestrutura

---

## 📦 Stack Tecnológica

| Componente    | Tecnologia                        |
| ------------- | --------------------------------- |
| **Linguagem** | Java 17                           |
| **Build**     | Maven 3.8+                        |
| **Testes**    | JUnit 5                           |
| **Servidor**  | Jakarta Servlet API               |
| **Deploy**    | Vercel Serverless                 |
| **IDE**       | VS Code + Extension Pack for Java |

---

## 🚀 Como Começar

### Pré-requisitos

```bash
java --version  # Java 17+
mvn --version   # Maven 3.8+
```

### Build Local

```bash
# Clone e navegue até o projeto
cd liststolist.test

# Build completo
mvn clean package

# Execute os testes
mvn test
```

**Resultado esperado:**

```
[INFO] BUILD SUCCESS
[INFO] Tests run: 6, Failures: 0, Errors: 0
```

---

## 📝 Componentes Principais

### 1. **Task** – Modelo de Dados Imutável

```java
Task task = new Task(
    "id-123",
    "Implementar API",
    estimatedTime: 5,
    priority: 9,
    dueDate: LocalDateTime.now().plusDays(2),
    dependencies: List.of("id-122")
);

task.isOverdue();  // → false
task.getUrgency(); // → 0 (não está atrasada)
```

**Propriedades:**

- `id` – Identificador único
- `title` – Descrição da tarefa
- `estimatedTime` – Horas necessárias
- `priority` – Escala de 1 a 10
- `dueDate` – Data limite
- `dependencies` – IDs das tarefas que esta depende

---

### 2. **PriorityEngine** – Matriz de Eisenhower

Classifica tarefas em uma matriz 2×2: combinações de Urgente/Importante.

```java
List<Task>[][] matrix = PriorityEngine.classify(tasks);

// matrix[0][0] = Não Urgente, Não Importante (Delegar)
// matrix[0][1] = Não Urgente, Importante (Planejar)
// matrix[1][0] = Urgente, Não Importante (Interromper)
// matrix[1][1] = Urgente, Importante (Fazer Primeiro)
```

**Algoritmos:**

- `classify(List<Task>)` – Classificação em matriz
- `calculatePriorityScore(Task)` – Fórmula de pontuação
- `getQuadrantName(int, int)` – Nome dos quadrantes
- `getUrgency()` / `getImportance()` – Helpers de classificação

---

### 3. **CriticalPathEngine** – Agendamento de Projetos

Identifica a cadeia de dependências mais longa (caminho crítico) para agendamento de projetos.

```java
List<Task> project = List.of(
    new Task("1", "Design", 5, 8, ..., List.of()),
    new Task("2", "Desenvolvimento", 8, 9, ..., List.of("1")),
    new Task("3", "Testes", 3, 8, ..., List.of("2"))
);

int criticalPath = CriticalPathEngine.calculate(project);  // → 16 horas

double pert = CriticalPathEngine.pertEstimate(2, 4, 8);  // → 4.33 horas
```

**Algoritmos:**

- `calculate(List<Task>)` – Cálculo do caminho crítico
- `getCriticalPath(List<Task>)` – Tarefas no caminho crítico
- `pertEstimate(int, int, int)` – Fórmula PERT: (O + 4M + P) / 6

---

## 🔌 Endpoints da API

### POST /api/tasks/create

Cria uma nova tarefa.

**Request:**

```bash
curl -X POST https://seu-app.vercel.app/api/tasks/create \
  -d "title=Aprender%20Vercel&estimatedTime=3&priority=8"
```

**Response:**

```json
{
  "id": "a1b2c3d4-e5f6-...",
  "title": "Aprender Vercel",
  "priority": 8,
  "priorityScore": 23,
  "status": "created"
}
```

---

### GET /api/tasks/list

Lista tarefas classificadas pela matriz de prioridade.

**Response:**

```json
{
  "total": 4,
  "matrix": {
    "DELEGATE (Not Urgent, Not Important)": {
      "count": 1,
      "tasks": [{"id": "4", "title": "Documentação", "priority": 4}]
    },
    "PLAN (Not Urgent, Important)": {
      "count": 1,
      "tasks": [{"id": "2", "title": "Refatorar projeto", "priority": 6}]
    },
    "INTERRUPT (Urgent, Not Important)": {...},
    "DO_FIRST (Urgent, Important)": {
      "count": 1,
      "tasks": [{"id": "1", "title": "Estudar Java", "priority": 9}]
    }
  }
}
```

---

### POST /api/tasks/schedule

Calcula o caminho crítico e estimativas PERT.

**Response:**

```json
{
  "criticalPathTime": 11,
  "criticalTasks": ["1", "2", "3"],
  "pertEstimate": 4.33,
  "totalTasks": 4
}
```

---

## ✅ Testes

Todos os testes são puros, stateless e independentes de plataforma.

```bash
mvn test

# Teste específico
mvn test -Dtest=PriorityEngineTest
mvn test -Dtest=CriticalPathEngineTest
```

**Cobertura de Testes:**

- ✅ Classificação na Matriz de Eisenhower
- ✅ Cálculo de pontuação de prioridade
- ✅ Detecção de tarefas atrasadas
- ✅ Algoritmos de caminho crítico
- ✅ Estimativa PERT
- ✅ Tratamento de listas vazias
- ✅ Dependências paralelas de tarefas

---

## 🌐 Deploy na Vercel

### Passo 1: Push para o GitHub

```bash
git init
git add .
git commit -m "Initial commit: Task Manager"
git push origin main
```

### Passo 2: Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New** → **Project**
3. Selecione seu repositório do GitHub
4. **Framework Preset:** None
5. **Build Command:** `mvn clean package`
6. **Output Directory:** `target`
7. Clique em **Deploy**

### Passo 3: Testar os Endpoints ao Vivo

```bash
curl https://seu-app.vercel.app/api/tasks/list
curl -X POST https://seu-app.vercel.app/api/tasks/create
curl -X POST https://seu-app.vercel.app/api/tasks/schedule
```

---

## 📊 Estrutura do Projeto

```
liststolist.test/
├── pom.xml                          # Configuração do Maven
├── vercel.json                      # Configuração serverless Vercel
├── README.md                        # Este arquivo
│
├── api/tasks/
│   ├── create.java                  # POST /api/tasks/create
│   ├── list.java                    # GET /api/tasks/list
│   └── schedule.java                # POST /api/tasks/schedule
│
└── src/
    ├── main/java/com/enterprise/taskmanager/
    │   ├── core/
    │   │   ├── Task.java            # Modelo imutável de tarefa
    │   │   └── PriorityEngine.java   # Matriz de Eisenhower
    │   └── scheduling/
    │       └── CriticalPathEngine.java  # Algoritmos de caminho crítico
    │
    └── test/java/com/enterprise/taskmanager/
        ├── PriorityEngineTest.java
        └── CriticalPathEngineTest.java
```

---

## 🎯 Princípios Aplicados

| Princípio              | Implementação                                            |
| ---------------------- | -------------------------------------------------------- |
| **Imutabilidade**      | `Task` usa apenas campos `final`                         |
| **Stateless**          | Todo estado é passado dentro/fora, sem variáveis globais |
| **Funções Puras**      | Determinísticas, sem efeitos colaterais                  |
| **Clean Architecture** | Separação entre Core ↔ Infraestrutura                    |
| **Testabilidade**      | 100% testável unitariamente, zero mocks necessários      |
| **Escalabilidade**     | Serverless, pronta para escalonamento horizontal         |
| **Padrões Enterprise** | Algoritmos Eisenhower, PERT, Caminho Crítico             |

---

## 💡 O que Este Projeto Demonstra

Desenvolvi este projeto para mostrar:

✅ **Domínio de Java** além de aplicações CRUD básicas  
✅ **Pensamento algorítmico** (agendamento, classificação)  
✅ **Arquitetura serverless** em plataforma real (Vercel)  
✅ **Princípios de Clean Code** (SOLID, DDD)  
✅ **Mentalidade DevOps** (design cloud-native)  
✅ **Testes profissionais** (JUnit 5, casos extremos)  
✅ **Código production-ready** (tratamento de erros, documentação)

Este projeto representa **engenharia de nível sênior**, não um trabalho de estudante.

---

## 📚 Referências

- [Documentação Java 17](https://docs.oracle.com/en/java/javase/17/)
- [Guia Oficial Maven](https://maven.apache.org/guides/)
- [Vercel Java Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/java)
- [Clean Architecture por Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Estimativa PERT](https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique)

---

## 📄 Licença

MIT License – Veja o arquivo [LICENSE](LICENSE).

---

**Desenvolvido com propósito. Pensado para produção. Pronto para avaliação.** 🚀
