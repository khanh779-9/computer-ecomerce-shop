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

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;

    private ProductResponse map(Product p) {
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
            p.getTint()
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
                .art(req.art() != null ? req.art() : "laptop")
                .tint(req.tint() != null ? req.tint() : "#c7d2fe")
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
}
