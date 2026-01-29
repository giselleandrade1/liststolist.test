# API Documentation (Local)

## Frontend Commands (CQRS)

### CREATE_TASK

```json
{
  "type": "CREATE_TASK",
  "payload": {
    "id": "uuid",
    "title": "Estudar",
    "estimatedMinutes": 120
  }
}
```

### UPDATE_STATUS

```json
{
  "type": "UPDATE_STATUS",
  "payload": {
    "id": "uuid",
    "status": "done",
    "progress": 100
  }
}
```

## Events

- TASK_CREATED
- STATUS_UPDATED

## Projeções

- Read Model em memória (Map)
- Indexação full-text em memória
