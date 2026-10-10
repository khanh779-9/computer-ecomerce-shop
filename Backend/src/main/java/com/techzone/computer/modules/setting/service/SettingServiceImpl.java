package com.techzone.computer.modules.setting.service;

import com.techzone.computer.modules.setting.dto.SettingResponse;
import com.techzone.computer.modules.setting.dto.SettingUpdateRequest;
import com.techzone.computer.modules.setting.entity.SystemSetting;
import com.techzone.computer.modules.setting.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    private final SystemSettingRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<SettingResponse> listAll() {
        return repo.findAllByOrderBySettingKeyAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SettingResponse getByKey(String key) {
        return repo.findBySettingKey(key)
                .map(this::toResponse)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cấu hình: " + key));
    }

    @Override
    @Transactional(readOnly = true)
    public String valueOf(String key, String defaultValue) {
        return repo.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .filter(v -> v != null && !v.isBlank())
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public SettingResponse upsert(Long updatedBy, String key, SettingUpdateRequest req) {
        String normalizedKey = key == null ? "" : key.trim().toLowerCase();
        if (normalizedKey.isEmpty()) {
            throw new IllegalArgumentException("Khóa cấu hình không hợp lệ");
        }

        SystemSetting setting = repo.findBySettingKey(normalizedKey).orElseGet(() -> SystemSetting.builder()
                .settingKey(normalizedKey)
                .valueType(guessValueType(req.value()))
                .build());

        setting.setSettingValue(req.value());
        if (req.description() != null && !req.description().isBlank()) {
            setting.setDescription(req.description());
        }
        if (req.isPublic() != null) {
            setting.setIsPublic(req.isPublic());
        }
        setting.setUpdatedBy(updatedBy);
        return toResponse(repo.save(setting));
    }

    private String guessValueType(String value) {
        if (value == null) return "STRING";
        if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) return "BOOLEAN";
        try {
            Integer.parseInt(value);
            return "NUMBER";
        } catch (NumberFormatException ignored) {
            return "STRING";
        }
    }

    private SettingResponse toResponse(SystemSetting s) {
        return new SettingResponse(
                s.getId(),
                s.getSettingKey(),
                s.getSettingValue(),
                s.getValueType(),
                s.getDescription(),
                s.getIsPublic(),
                s.getUpdatedBy(),
                s.getUpdatedAt() != null ? ISO.format(s.getUpdatedAt()) : null
        );
    }
}
