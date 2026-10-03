package com.techzone.computer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class DbMigrateRunnerTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void executeDbRefactorAndSeed() {
        System.out.println("=== [START] CONNECTING TO DATABASE TO REFACTOR & SEED ===");

        // 1. Run V1__schema.sql
        System.out.println("Applying schema: db/migration/V1__schema.sql...");
        ResourceDatabasePopulator schemaPopulator = new ResourceDatabasePopulator(
                true,
                false,
                StandardCharsets.UTF_8.name(),
                new ClassPathResource("db/migration/V1__schema.sql")
        );
        schemaPopulator.execute(dataSource);

        // 2. Run V2__seed_products.sql
        System.out.println("Applying seed data: db/migration/V2__seed_products.sql...");
        ResourceDatabasePopulator seedPopulator = new ResourceDatabasePopulator(
                true,
                false,
                StandardCharsets.UTF_8.name(),
                new ClassPathResource("db/migration/V2__seed_products.sql")
        );
        seedPopulator.execute(dataSource);

        // 3. Verify reviews table columns
        System.out.println("Verifying columns of reviews table in PostgreSQL...");
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews' ORDER BY ordinal_position"
        );
        for (Map<String, Object> col : columns) {
            System.out.println(" - " + col.get("column_name") + " (" + col.get("data_type") + ")");
        }

        // Check existing products and users
        List<Map<String, Object>> prods = jdbcTemplate.queryForList("SELECT id, sku, name FROM products LIMIT 5");
        System.out.println("Products found: " + prods.size());
        for (Map<String, Object> p : prods) {
            System.out.println("Prod: id=" + p.get("id") + ", sku=" + p.get("sku") + ", name=" + p.get("name"));
        }

        List<Map<String, Object>> users = jdbcTemplate.queryForList("SELECT id, email, full_name FROM users");
        System.out.println("Users found: " + users.size());
        for (Map<String, Object> u : users) {
            System.out.println("User: id=" + u.get("id") + ", email=" + u.get("email") + ", name=" + u.get("full_name"));
        }

        // Insert real reviews directly via JdbcTemplate if table is empty
        Integer currentCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM reviews", Integer.class);
        if (currentCount == null || currentCount == 0) {
            System.out.println("Inserting reviews directly...");
            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, u.id, 'Nguyễn Văn An', 5, 'Máy chạy cực kỳ êm và mượt mà', 'Mình mua máy này được 2 tuần để làm đồ họa và code. Máy mát, màn hình đẹp sắc nét, bàn phím gõ êm tay, pin dùng văn phòng được tầm 5-6 tiếng. Shop giao hàng siêu nhanh chỉ trong 2 tiếng tại TP.HCM!', true, 12, 'APPROVED', now() - interval '5 days', now() " +
                "FROM products p LEFT JOIN users u ON u.email = 'customer@techzone.vn' " +
                "WHERE p.id = (SELECT MIN(id) FROM products)"
            );

            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, u.id, 'Trần Minh Đức (VIP)', 5, 'Chất lượng hoàn thiện tuyệt hảo', 'Sản phẩm chính hãng nguyên seal, đúng như mô tả. Đóng gói 3 lớp chống sốc cẩn thận. Rất hài lòng về dịch vụ tư vấn nhiệt tình của TechZone!', true, 8, 'APPROVED', now() - interval '3 days', now() " +
                "FROM products p LEFT JOIN users u ON u.email = 'vip@techzone.vn' " +
                "WHERE p.id = (SELECT MIN(id) FROM products)"
            );

            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, 'Hoàng Long Vũ', 4, 'Tốt trong tầm giá', 'Hiệu năng tốt, build cứng cáp. Chỉ tiếc là loa ngoài hơi bé một chút khi ở phòng rộng, còn lại mọi thứ đều ổn định.', true, 3, 'APPROVED', now() - interval '8 days', now() " +
                "FROM products p " +
                "WHERE p.id = (SELECT MIN(id) FROM products)"
            );

            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, 'Lê Tuấn Kiệt', 5, 'Chiến game mát mẻ, fps cao', 'Đã test thử CS2 và Black Myth Wukong trên con này, tản nhiệt CoolBoost chạy rất êm và hiệu quả. Màn hình 144Hz mượt mà không bị xé hình. 10 điểm cho shop!', true, 15, 'APPROVED', now() - interval '2 days', now() " +
                "FROM products p " +
                "WHERE p.id = (SELECT id FROM products ORDER BY id OFFSET 1 LIMIT 1)"
            );

            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, 'Phạm Quỳnh Nga', 5, 'Thiết kế mỏng nhẹ sang trọng', 'Cầm nhẹ tênh mang đi cafe rất tiện. Màn hình sắc nét, loa nghe nhạc rất hay. Mua đợt khuyến mãi giá tốt còn được tặng kèm quà tặng cao cấp.', true, 19, 'APPROVED', now() - interval '4 days', now() " +
                "FROM products p " +
                "WHERE p.id = (SELECT id FROM products ORDER BY id OFFSET 2 LIMIT 1)"
            );

            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, 'Đặng Minh Quân', 5, 'Cấu hình khủng, đi dây gọn gàng', 'TechZone lắp ráp PC cực kỳ có tâm, đi dây giấu gọn gàng sạch sẽ. Test thử Render 3D và Premiere Pro xuất video 4K nhanh như chớp. Đáng từng đồng bát gạo!', true, 24, 'APPROVED', now() - interval '1 day', now() " +
                "FROM products p " +
                "WHERE p.id = (SELECT id FROM products ORDER BY id OFFSET 3 LIMIT 1)"
            );

            jdbcTemplate.execute(
                "INSERT INTO reviews (product_id, user_name, rating, title, content, is_verified_purchase, likes_count, status, created_at, updated_at) " +
                "SELECT p.id, 'Nguyễn Hữu Đạt', 5, 'Dùng cực bền và nhạy', 'Pin trâu vô địch, mình dùng mấy tháng rồi chưa phải thay. Mắt đọc vẩy cực chuẩn không hề bị delay hay delay tín hiệu.', true, 42, 'APPROVED', now() - interval '10 days', now() " +
                "FROM products p " +
                "WHERE p.id = (SELECT id FROM products ORDER BY id OFFSET 4 LIMIT 1)"
            );
        }

        // 4. Verify seeded reviews
        System.out.println("Verifying seeded reviews...");
        List<Map<String, Object>> reviews = jdbcTemplate.queryForList(
                "SELECT r.id, r.product_id, r.user_name, r.rating, r.title, r.is_verified_purchase FROM reviews r ORDER BY r.id"
        );
        System.out.println("Total reviews in DB: " + reviews.size());
        org.junit.jupiter.api.Assertions.assertTrue(reviews.size() > 0, "Reviews must be seeded in DB");
        for (Map<String, Object> rev : reviews) {
            System.out.println(" * Review #" + rev.get("id") + " for product #" + rev.get("product_id")
                    + " by [" + rev.get("user_name") + "] (" + rev.get("rating") + " stars): " + rev.get("title")
                    + " [Verified: " + rev.get("is_verified_purchase") + "]");
        }

        // 5. Update products rating and review_count based on reviews in DB
        System.out.println("Updating products rating & review_count based on actual reviews in DB...");
        jdbcTemplate.execute(
                "UPDATE products p " +
                "SET review_count = sub.cnt, rating = sub.avg_rate " +
                "FROM ( " +
                "    SELECT product_id, COUNT(*) as cnt, ROUND(AVG(rating), 1) as avg_rate " +
                "    FROM reviews " +
                "    WHERE status = 'APPROVED' " +
                "    GROUP BY product_id " +
                ") sub " +
                "WHERE p.id = sub.product_id"
        );

        System.out.println("=== [COMPLETED] DATABASE REFACTORED AND SEEDED SUCCESSFULLY ===");
    }
}
