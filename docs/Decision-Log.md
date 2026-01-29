# Decision Log

| Data       | Decisão               | Justificativa                   | Consequência          |
| ---------- | --------------------- | ------------------------------- | --------------------- |
| 2026-01-29 | Microkernel + Plugins | Extensibilidade sem acoplamento | Núcleo minimalista    |
| 2026-01-29 | CQRS + Event Sourcing | Histórico e auditoria           | Projeções derivadas   |
| 2026-01-29 | CRDT LWW-Set          | Resolução de conflitos offline  | Convergência eventual |
| 2026-01-29 | IndexedDB             | Persistência local sem servidor | Complexidade extra    |
| 2026-01-29 | Sem libs core         | Controle total                  | Mais código manual    |
