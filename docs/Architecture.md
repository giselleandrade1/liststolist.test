# Arquitetura Técnica — LembraFácil Pro Lab

## Visão geral (Microkernel + Event Sourcing + CQRS)

```mermaid
flowchart TB
  UI[UI & Views] -->|Commands| CommandBus
  CommandBus --> Store[StateStore]
  Store --> EventLog[(Event Log)]
  Store --> Projection[(Read Model)]
  Projection -->|Queries| UI
  Store --> PluginKernel
  PluginKernel --> Plugins[Plugins]
  Store --> Cache[ARC Cache]
  Store --> CRDT[LWW-Set]
  Store --> DB[(IndexedDB)]
```

## Sequência — criação de tarefa

```mermaid
sequenceDiagram
  participant U as Usuário
  participant UI as UI
  participant Store as StateStore
  participant ES as EventLog
  participant RM as Projection
  U->>UI: Adicionar tarefa
  UI->>Store: dispatch(CREATE_TASK)
  Store->>ES: append(event)
  Store->>RM: apply(event)
  RM-->>UI: query()
```

## Estruturas avançadas usadas

- Matriz 4D (urgência × importância × energia × contexto)
- Grafo dirigido (dependências)
- Árvore n-ária (categorias)
- Filas de prioridade (heap binário)
- LRU/ARC (cache adaptativo)
- Lista encadeada (LRU/ARC internamente)

## Padrões aplicados

- Microkernel (PluginKernel)
- Observer (EventBus)
- Strategy (prioridades)
- Factory (TaskFactory)
- CQRS + Event Sourcing (StateStore)
