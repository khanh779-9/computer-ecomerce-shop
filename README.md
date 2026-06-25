# TechZone Computer E-commerce Platform

Nền tảng thương mại điện tử chuyên bán lẻ máy tính & thiết bị công nghệ với kiến trúc tách biệt Frontend / Backend / Database / Infrastructure.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI + Vitest.
- **Backend:** Java 17 + Spring Boot (Modular Monolith) + Spring Data JPA + Flyway + Redis Caching + JUnit 5.
- **Database:** PostgreSQL schema với Flyway migrations & indexes tối ưu tìm kiếm.
- **Infrastructure:** Docker Compose cung cấp trọn gói PostgreSQL, Redis, MinIO, Backend và Frontend.

## Hướng dẫn chạy nhanh

### Cách 1: Chạy trực tiếp (Local Development)
1. **Frontend:**
   ```bash
   cd Frontend
   pnpm install
   pnpm dev
   ```
   - Truy cập giao diện khách hàng: http://localhost:5173
   - Truy cập giao diện quản trị: http://localhost:5173/internal

2. **Backend:**
   ```bash
   cd Backend
   .\mvnw.cmd spring-boot:run
   ```
   - Swagger OpenAPI Docs: http://localhost:8080/swagger-ui/index.html

### Cách 2: Chạy qua Docker Compose
```bash
docker compose up -d --build
```

## Route Tree
- External routes (Customer): `/`, `/products/:id`, `/cart`, `/checkout`
- Internal routes (Staff/Admin): `/internal`, `/internal/products`, `/internal/orders`, `/internal/customers`, `/internal/reviews`
