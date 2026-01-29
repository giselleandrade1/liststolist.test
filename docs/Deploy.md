# Deploy Guide (Local + Static)

## Local

```bash
python3 -m http.server 8080 --directory public
```

## Static Hosting

- Copie /public para qualquer host estático
- Inclua service worker e manifest

## Vercel (estático)

```bash
vercel --prod
```
