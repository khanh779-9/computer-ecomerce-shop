package com.techzone.computer.modules.product.service;

import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.dto.ProductUpsertRequest;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final String TRENDING_SEARCH_KEY = "search:trending_keywords";

    private ProductResponse map(Product p) {
        String imgUrl = p.getImageUrl();
        if (imgUrl == null || imgUrl.isBlank()) {
            String art = p.getArt() != null ? p.getArt() : "laptop";
            imgUrl = (art.startsWith("/") || art.startsWith("http")) ? art : "/images/products/" + art + ".svg";
        }

        return new ProductResponse(
            p.getId(),
            p.getSku(),
            p.getName(),
            p.getBrand(),
            p.getCategory(),
            p.getPrice(),
            p.getOldPrice(),
            p.getRating(),
            p.getReviewCount(),
            p.getSold(),
            p.getStock(),
            p.getArt(),
            p.getTint(),
            imgUrl
        );
    }

    @Override
    @Cacheable(value = "products", key = "(#q == null ? '' : #q) + '-' + (#category == null ? '' : #category)")
    @Transactional(readOnly = true)
    public List<ProductResponse> find(String q, String category) {
        Specification<Product> s = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + q.toLowerCase().trim() + "%"));
            }
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("Tất cả")) {
                predicates.add(cb.equal(root.get("category"), category.trim()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        if (q != null && !q.isBlank()) {
            recordSearch(q.trim());
        }
        return repo.findAll(s).stream().map(this::map).toList();
    }

    @Override
    @Cacheable(value = "product", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        return repo.findById(id)
                .map(this::map)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm ID: " + id));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse create(ProductUpsertRequest req) {
        String art = req.art() != null ? req.art() : "laptop";
        String img = req.imageUrl();
        if (img == null || img.isBlank()) {
            img = (art.startsWith("/") || art.startsWith("http")) ? art : "/images/products/" + art + ".svg";
        }

        Product p = Product.builder()
                .sku(req.sku() != null && !req.sku().isBlank() ? req.sku() : "SKU-" + System.currentTimeMillis())
                .name(req.name())
                .brand(req.brand() != null ? req.brand() : "Khác")
                .category(req.category())
                .price(req.price())
                .oldPrice(req.oldPrice() != null ? req.oldPrice() : req.price())
                .rating(req.rating() != null ? req.rating() : 5.0)
                .reviewCount(req.reviewCount() != null ? req.reviewCount() : 0)
                .sold(req.sold() != null ? req.sold() : 0)
                .stock(req.stock() != null ? req.stock() : 10)
                .art(art)
                .tint(req.tint() != null ? req.tint() : "#c7d2fe")
                .imageUrl(img)
                .build();

        return map(repo.save(p));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse update(Long id, ProductUpsertRequest req) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm ID: " + id));

        if (req.sku() != null && !req.sku().isBlank()) p.setSku(req.sku());
        p.setName(req.name());
        if (req.brand() != null) p.setBrand(req.brand());
        p.setCategory(req.category());
        p.setPrice(req.price());
        if (req.oldPrice() != null) p.setOldPrice(req.oldPrice());
        if (req.rating() != null) p.setRating(req.rating());
        if (req.reviewCount() != null) p.setReviewCount(req.reviewCount());
        if (req.sold() != null) p.setSold(req.sold());
        if (req.stock() != null) p.setStock(req.stock());
        if (req.art() != null) p.setArt(req.art());
        if (req.tint() != null) p.setTint(req.tint());
        if (req.imageUrl() != null) p.setImageUrl(req.imageUrl());
        return map(repo.save(p));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy sản phẩm ID: " + id);
        }
        repo.deleteById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse deductStock(Long id, Integer quantity) {
        Product product = repo.findByIdWithLock(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm có ID: " + id));

        int currentStock = product.getStock() != null ? product.getStock() : 0;
        int qtyToDeduct = quantity != null ? quantity : 0;

        if (currentStock < qtyToDeduct) {
            throw new IllegalStateException("Sản phẩm '" + product.getName() + "' không đủ số lượng tồn kho (còn " + currentStock + ")");
        }

        product.setStock(currentStock - qtyToDeduct);
        product.setSold((product.getSold() != null ? product.getSold() : 0) + qtyToDeduct);
        return map(repo.save(product));
    }

    @Override
    public void recordSearch(String query) {
        if (query == null || query.trim().length() < 2 || redisTemplate == null) return;
        try {
            String term = query.trim();
            redisTemplate.opsForZSet().incrementScore(TRENDING_SEARCH_KEY, term, 1);
            redisTemplate.expire(TRENDING_SEARCH_KEY, Duration.ofDays(7));
        } catch (Exception ignored) {}
    }

    @Override
    public List<String> getTrendingSearches() {
        if (redisTemplate != null) {
            try {
                Set<String> top = redisTemplate.opsForZSet().reverseRange(TRENDING_SEARCH_KEY, 0, 7);
                if (top != null && !top.isEmpty()) {
                    return new ArrayList<>(top);
                }
            } catch (Exception ignored) {}
        }

        List<String> defaults = List.of(
            "Laptop Gaming",
            "RTX 4060",
            "Bàn phím cơ",
            "Màn hình 2K",
            "Logitech G304",
            "Tai nghe chụp tai",
            "Core i7 14700K",
            "RAM 16GB"
        );

        if (redisTemplate != null) {
            try {
                for (int i = 0; i < defaults.size(); i++) {
                    redisTemplate.opsForZSet().add(TRENDING_SEARCH_KEY, defaults.get(i), defaults.size() - i);
                }
                redisTemplate.expire(TRENDING_SEARCH_KEY, Duration.ofDays(7));
            } catch (Exception ignored) {}
        }

        return defaults;
    }
}
