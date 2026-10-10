package com.techzone.computer.modules.setting.service;

import com.techzone.computer.modules.setting.dto.SettingResponse;
import com.techzone.computer.modules.setting.dto.SettingUpdateRequest;

import java.util.List;

public interface SettingService {

    List<SettingResponse> listAll();

    SettingResponse getByKey(String key);

    String valueOf(String key, String defaultValue);

    SettingResponse upsert(Long updatedBy, String key, SettingUpdateRequest req);
}
