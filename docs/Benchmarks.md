# Performance Benchmarks (Simulados)

| Operação         | N=1k | N=10k | Observações              |
| ---------------- | ---- | ----- | ------------------------ |
| Classificação 4D | 4ms  | 30ms  | O(n) com loops aninhados |
| Critical Path    | 2ms  | 16ms  | O(V+E)                   |
| Round Robin      | 1ms  | 9ms   | O(n)                     |
| CRDT Merge       | 1ms  | 8ms   | O(n)                     |

Hardware alvo: laptop i7 / 16GB / Chrome 120
