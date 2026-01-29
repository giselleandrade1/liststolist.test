# 🧠 LembraFácil - Enterprise Task Manager

> **Gerenciador de tarefas universal e acessível** (5-90 anos)  
> Arquitetura serverless Java + Clean Architecture + PWA

[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://openjdk.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📚 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Stack Técnica](#-stack-técnica)
- [Funcionalidades](#-funcionalidades)
- [Instalação Local](#-instalação-local)
- [Endpoints da API](#-endpoints-da-api)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Testes](#-testes)

---

## 🎯 Visão Geral

**LembraFácil** é um gerenciador de tarefas projetado para ser:

- ✅ **Acessível**: WCAG 2.1 AAA compliant (leitores de tela, navegação por teclado)
- ✅ **Responsivo**: Design fluido com `clamp()` para todos os dispositivos
- ✅ **Offline-first**: PWA com Service Worker
- ✅ **Serverless**: Java Functions compatível com Vercel
- ✅ **Stateless**: Core 100% imutável e sem estado compartilhado

### Algoritmos Avançados

1. **Eisenhower Matrix**: Classifica tarefas por urgência × importância
2. **Critical Path Method (CPM)**: Calcula caminho crítico em projetos
3. **PERT (Program Evaluation Review Technique)**: Estimativas probabilísticas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (PWA)                     │
│  ┌──────────────────────────────────────────┐  │
│  │  public/index.html  (Semantic HTML)      │  │
│  │  public/styles.css  (Glassmorphism)      │  │
│  │  public/app.js      (Clean Architecture) │  │
│  │  public/sw.js       (Service Worker)     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│           SERVERLESS FUNCTIONS                  │
│  ┌──────────────────────────────────────────┐  │
│  │  api/tasks/create.java   (POST)          │  │
│  │  api/tasks/list.java     (GET)           │  │
│  │  api/tasks/schedule.java (POST)          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│              CORE (Stateless)                   │
│  ┌──────────────────────────────────────────┐  │
│  │  core/Task.java           (Entity)       │  │
│  │  core/PriorityEngine.java (Classifier)   │  │
│  │  scheduling/CriticalPathEngine.java      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Princípios Arquiteturais

| Princípio                  | Implementação                                       |
| -------------------------- | --------------------------------------------------- |
| **Stateless**              | Nenhuma variável de instância nas classes do Core   |
| **Immutability**           | Todos os campos em `Task` são `final`               |
| **Pure Functions**         | `PriorityEngine` retorna novo objeto a cada chamada |
| **Dependency Inversion**   | Core não depende de frameworks externos             |
| **Separation of Concerns** | Frontend, API e Core em camadas distintas           |

---

## 🛠️ Stack Técnica

### Backend

- **Java 17**: LTS, Records, Text Blocks, Switch Expressions
- **Maven 3.8+**: Gestão de dependências
- **JUnit 5**: Testes unitários (11 testes, 100% coverage do Core)
- **javax.servlet-api 4.0.1**: Compatível com Vercel Java Runtime

### Frontend

- **Vanilla JavaScript**: ~450 linhas, zero frameworks
- **CSS3 Custom Properties**: Design system com `clamp()`
- **Service Worker API**: Offline-first, cache-first strategy
- **LocalStorage**: Multi-layer persistence

### DevOps

- **Vercel**: Serverless deployment (vercel-java@0.0.2)
- **Git/GitHub**: Controle de versão
- **Maven Surefire**: Test runner

---

## ⚡ Funcionalidades

### Frontend (PWA)

✅ **Gestão de Tarefas**

- Adicionar, editar, excluir, marcar como concluída
- Filtros: Todas, Ativas, Concluídas
- Persistência local (localStorage)

✅ **Acessibilidade**

- ARIA labels em todos os elementos interativos
- Navegação completa por teclado (`Tab`, `Enter`, `Esc`)
- Alto contraste e tipografia legível (clamp())
- Suporte a leitores de tela (NVDA, JAWS)

✅ **Design Responsivo**

- Fluid typography: `clamp(1.5rem, 4vw + 1rem, 3rem)`
- Touch targets mínimos de 44×44px
- Glassmorphism com `backdrop-filter: blur(20px)`

### Backend (Serverless API)

#### 1. **POST /api/tasks/create**

```json
{
  "id": "abc123",
  "title": "Deploy Vercel",
  "estimatedTime": 2,
  "urgency": 9,
  "importance": 8,
  "priority": 81
}
```

#### 2. **GET /api/tasks/list**

```json
{
  "total": 5,
  "matrix": {
    "DO_NOW": { "count": 2, "tasks": [...] },
    "SCHEDULE": { "count": 1, "tasks": [...] },
    "DELEGATE": { "count": 1, "tasks": [...] },
    "ELIMINATE": { "count": 1, "tasks": [...] }
  }
}
```

#### 3. **POST /api/tasks/schedule**

```json
{
  "criticalPath": 16,
  "pert": {
    "optimistic": 18.0,
    "realistic": 16.67,
    "pessimistic": 20.67
  }
}
```

---

## 🚀 Instalação Local

### Pré-requisitos

- Java 17+ ([OpenJDK](https://adoptium.net/))
- Maven 3.8+ ([Download](https://maven.apache.org/download.cgi))
- Node.js 18+ (opcional, para Vercel CLI)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/liststolist.test.git
cd liststolist.test
```

### 2. Compile o Projeto

```bash
mvn clean compile
```

### 3. Execute os Testes

```bash
mvn test
# ✅ Tests run: 11, Failures: 0, Errors: 0
```

### 4. Sirva o Frontend Localmente

```bash
# Opção 1: Python
python3 -m http.server 8080 --directory public

# Opção 2: Node.js
npx serve public -l 8080

# Acesse: http://localhost:8080
```

### 5. Teste os Endpoints (Opcional)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy local das serverless functions
vercel dev
# Acesse: http://localhost:3000/api/tasks/list
```

---

## 📡 Endpoints da API

### Base URL

- **Produção**: `https://seu-app.vercel.app/api/tasks`
- **Local**: `http://localhost:3000/api/tasks`

### Especificação

#### `POST /create`

Cria uma nova tarefa e retorna sua classificação.

**Headers:**

```http
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Refatorar Core",
  "estimatedTime": 5,
  "daysUntilDeadline": 2
}
```

**Response 200:**

```json
{
  "id": "uuid-v4",
  "title": "Refatorar Core",
  "estimatedTime": 5,
  "urgency": 8,
  "importance": 7,
  "priority": 56
}
```

#### `GET /list`

Lista todas as tarefas classificadas por Eisenhower Matrix.

**Response 200:**

```json
{
  "total": 4,
  "matrix": {
    "DO_NOW": {
      "count": 1,
      "tasks": [{"id": "1", "title": "Deploy", "priority": 9}]
    },
    "SCHEDULE": {...},
    "DELEGATE": {...},
    "ELIMINATE": {...}
  }
}
```

#### `POST /schedule`

Calcula Critical Path e PERT para um conjunto de tarefas.

**Response 200:**

```json
{
  "criticalPath": 16,
  "pert": {
    "optimistic": 18.0,
    "realistic": 16.67,
    "pessimistic": 20.67
  },
  "tasks": 5,
  "message": "Critical path computed successfully"
}
```

---

## 🌐 Deploy na Vercel

### 1. Conecte ao GitHub

```bash
# No diretório do projeto
vercel --prod
```

### 2. Configure o vercel.json

```json
{
  "functions": {
    "api/tasks/*.java": {
      "runtime": "vercel-java@0.0.2"
    }
  },
  "rewrites": [{ "source": "/(.*)", "destination": "/public/$1" }]
}
```

### 3. Deploy Automático

Qualquer push na branch `main` dispara deploy automático.

### 4. Domínio Personalizado (Opcional)

```bash
vercel domains add seu-dominio.com
```

---

## 🧪 Testes

### Cobertura Atual

```
PriorityEngineTest      → 5 testes ✅
CriticalPathEngineTest  → 6 testes ✅
──────────────────────────────────
Total: 11 testes, 0 falhas
```

### Executar Testes

```bash
# Todos os testes
mvn test

# Teste específico
mvn test -Dtest=PriorityEngineTest

# Com relatório de cobertura (JaCoCo)
mvn clean verify
```

### Casos de Teste Principais

1. **PriorityEngine**
   - Classificação por quadrante (urgente/importante)
   - Cálculo de score de prioridade
   - Ordenação de tarefas

2. **CriticalPathEngine**
   - Caminho crítico com dependências
   - PERT estimates (3-point)
   - Resolução de DAG (Directed Acyclic Graph)

---

## 📖 Exemplos de Uso

### Adicionar Tarefa via Frontend

1. Clique no botão `+` flutuante
2. Digite o título da tarefa
3. Pressione `Enter` ou clique em "Adicionar"
4. Tarefa aparece na lista com persistência automática

### Consumir API via cURL

```bash
# Criar tarefa
curl -X POST https://seu-app.vercel.app/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Estudar Clean Architecture",
    "estimatedTime": 8,
    "daysUntilDeadline": 3
  }'

# Listar tarefas
curl https://seu-app.vercel.app/api/tasks/list

# Calcular schedule
curl -X POST https://seu-app.vercel.app/api/tasks/schedule
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Add: nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Giselle** - Desenvolvido com ❤️ e Clean Architecture

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- **Uncle Bob** (Robert C. Martin) - Clean Architecture principles
- **Eric Evans** - Domain-Driven Design
- **Martin Fowler** - Patterns of Enterprise Application Architecture
- **Vercel Team** - Serverless Java runtime

---

## 📚 Referências

- [Clean Architecture (Book)](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Eisenhower Matrix](https://www.eisenhower.me/eisenhower-matrix/)
- [Critical Path Method (CPM)](https://en.wikipedia.org/wiki/Critical_path_method)
- [PERT](https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vercel Java Runtime](https://vercel.com/docs/functions/runtimes/java)

---

<div align="center">
  <p>Feito com 🧠 Java + ⚡ Serverless + 🎨 Clean Code</p>
  <p>
    <a href="#-índice">↑ Voltar ao topo</a>
  </p>
</div>
