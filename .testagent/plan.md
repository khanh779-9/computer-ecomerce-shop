# Test generation plan

1. Add `CartServiceTest` for cart creation/reuse, quantity rules, stock caps, removal and clearing.
2. Add `ReviewServiceTest` for review summary, verified purchase and points, rating updates, likes and not-found paths.
3. Add `WishlistServiceTest` for duplicate-safe add, missing product, mapping and delete operations.
4. Add `UserServiceTest` for registration/login/profile and membership tier transitions.
5. Run the complete Maven test suite on Java 21 and fix only test or tightly coupled defects.

No requirements are intentionally blocked.
