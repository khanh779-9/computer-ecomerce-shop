# Backend

Java 17 + Spring Boot modular monolith. Run with Maven directly; Docker is optional only for infrastructure.

## Environment
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `SERVER_PORT`.

## API
- `GET /api/health`
- `GET /api/products?search=&category=`
- `GET /api/products/{id}`
