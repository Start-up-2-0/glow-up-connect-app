## Checklist de segurança

- [ ] Tokens não persistidos em localStorage (refresh via cookie HttpOnly)
- [ ] Sem secrets no bundle ou `.env` commitado
- [ ] Chamadas API sensíveis usam `withCredentials` quando necessário
