# Test generation research

## Scope

The request is project-wide backend unit-test expansion for the Java Spring Boot
application under `Backend`.

## Existing conventions

- JUnit 5 with `@ExtendWith(MockitoExtension.class)`.
- Mockito mocks for repositories and collaborating services.
- Maven Surefire via `.\mvnw.cmd test`.
- Existing tests use direct service tests and assert returned DTOs plus repository interactions.

## Target inventory and acceptance checklist

- Cart service: create/reuse carts, add/update/remove/clear items, stock caps and missing products.
- Review service: summary rounding/defaults, verified purchases, points, rating recalculation, likes and missing reviews.
- Wishlist service: add without duplicates, missing products, list mapping, remove/clear.
- User service: registration, duplicate email, login password validation, profile lookup, reward-tier transitions.
- Existing order, payment, voucher, product, migration tests must remain passing.
