package com.techzone.computer.modules.manufacturer.service;

import com.techzone.computer.modules.manufacturer.dto.ManufacturerRequest;
import com.techzone.computer.modules.manufacturer.dto.ManufacturerResponse;
import com.techzone.computer.modules.manufacturer.entity.Manufacturer;
import com.techzone.computer.modules.manufacturer.repository.ManufacturerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManufacturerServiceImpl implements ManufacturerService {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");

    private final ManufacturerRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<ManufacturerResponse> list() {
        Map<Long, Long> counts = repo.countProductsByManufacturerId().stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));
        return repo.findAllByOrderByNameAsc().stream()
                .map(m -> toResponse(m, counts.get(m.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listActiveNames() {
        return repo.findActiveNames();
    }

    @Override
    @Transactional
    public ManufacturerResponse create(ManufacturerRequest req) {
        String name = req.name().trim();
        if (repo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Nhà sản xuất '" + name + "' đã tồn tại trong hệ thống");
        }
        Manufacturer manufacturer = Manufacturer.builder()
                .name(name)
                .slug(slugOf(name, req.slug()))
                .website(req.website())
                .contactEmail(req.contactEmail())
                .phone(req.phone())
                .isActive(req.isActive() == null || req.isActive())
                .build();
        return toResponse(repo.save(manufacturer), null);
    }

    @Override
    @Transactional
    public ManufacturerResponse update(Long id, ManufacturerRequest req) {
        Manufacturer manufacturer = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhà sản xuất ID: " + id));

        String name = req.name().trim();
        if (!manufacturer.getName().equalsIgnoreCase(name) && repo.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Nhà sản xuất '" + name + "' đã tồn tại trong hệ thống");
        }
        manufacturer.setName(name);
        if (req.slug() != null && !req.slug().isBlank()) {
            manufacturer.setSlug(slugOf(name, req.slug()));
        } else if (!manufacturer.getName().equals(name)) {
            manufacturer.setSlug(slugOf(name, null));
        }
        manufacturer.setWebsite(req.website());
        manufacturer.setContactEmail(req.contactEmail());
        manufacturer.setPhone(req.phone());
        if (req.isActive() != null) {
            manufacturer.setIsActive(req.isActive());
        }
        return toResponse(repo.save(manufacturer), null);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy nhà sản xuất ID: " + id);
        }
        // products.manufacturer_id có ON DELETE SET NULL — sản phẩm không bị mất khi xóa NSX
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
        return slug.isBlank() ? "mfr-" + System.currentTimeMillis() : slug;
    }

    private ManufacturerResponse toResponse(Manufacturer m, Long productCount) {
        return new ManufacturerResponse(
                m.getId(),
                m.getName(),
                m.getSlug(),
                m.getWebsite(),
                m.getContactEmail(),
                m.getPhone(),
                m.getIsActive(),
                productCount != null ? productCount : 0
        );
    }
}
