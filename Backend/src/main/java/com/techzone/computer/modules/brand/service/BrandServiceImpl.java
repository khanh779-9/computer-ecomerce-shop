package com.techzone.computer.modules.brand.service;

import com.techzone.computer.modules.brand.dto.BrandRequest;
import com.techzone.computer.modules.brand.dto.BrandResponse;
import com.techzone.computer.modules.brand.entity.Brand;
import com.techzone.computer.modules.brand.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");

    private final BrandRepository repo;

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "brands", sync = true)
    @Transactional(readOnly = true)
    public List<BrandResponse> list() {
        Map<Long, Object[]> stats = repo.findAllWithProductStats().stream()
                .collect(Collectors.toMap(row -> (Long) row[0], Function.identity()));
        return repo.findAll().stream()
                .map(brand -> toResponse(brand, stats.get(brand.getId())))
                .sorted((a, b) -> Long.compare(b.productCount(), a.productCount()))
                .toList();
    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "brand_names", sync = true)
    @Transactional(readOnly = true)
    public List<String> listNames() {
        return repo.findAllNames();
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"brands", "brand_names"}, allEntries = true)
    public BrandResponse create(BrandRequest req) {
        String name = req.name().trim();
        if (repo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Hãng '" + name + "' đã tồn tại trong hệ thống");
        }
        Brand brand = Brand.builder()
                .name(name)
                .slug(slugOf(name, req.slug()))
                .isActive(req.isActive() == null || req.isActive())
                .build();
        return toResponse(repo.save(brand), null);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"brands", "brand_names"}, allEntries = true)
    public BrandResponse update(Long id, BrandRequest req) {
        Brand brand = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hãng ID: " + id));

        String name = req.name().trim();
        if (!brand.getName().equalsIgnoreCase(name) && repo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Hãng '" + name + "' đã tồn tại trong hệ thống");
        }
        brand.setName(name);
        if (req.slug() != null && !req.slug().isBlank()) {
            brand.setSlug(slugOf(name, req.slug()));
        } else if (!brand.getName().equals(name)) {
            brand.setSlug(slugOf(name, null));
        }
        if (req.isActive() != null) {
            brand.setIsActive(req.isActive());
        }
        return toResponse(repo.save(brand), null);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"brands", "brand_names"}, allEntries = true)
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy hãng ID: " + id);
        }
        // products.brand_id có ON DELETE SET NULL — sản phẩm không bị mất khi xóa hãng
        repo.deleteById(id);
    }

    private String slugOf(String name, String explicitSlug) {
        if (explicitSlug != null && !explicitSlug.isBlank()) {
            return explicitSlug.trim().toLowerCase(Locale.ROOT);
        }
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = NON_ALPHANUMERIC.matcher(normalized.toLowerCase(Locale.ROOT))
                .replaceAll("-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? "brand-" + System.currentTimeMillis() : slug;
    }

    private BrandResponse toResponse(Brand brand, Object[] statsRow) {
        long productCount = statsRow != null ? ((Number) statsRow[4]).longValue() : 0;
        long totalStock = statsRow != null ? ((Number) statsRow[5]).longValue() : 0;
        long totalSold = statsRow != null ? ((Number) statsRow[6]).longValue() : 0;
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getSlug(),
                brand.getIsActive(),
                productCount,
                totalStock,
                totalSold
        );
    }
}
