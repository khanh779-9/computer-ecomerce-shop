package com.techzone.computer.modules.manufacturer.service;

import com.techzone.computer.modules.manufacturer.dto.ManufacturerRequest;
import com.techzone.computer.modules.manufacturer.dto.ManufacturerResponse;

import java.util.List;

public interface ManufacturerService {

    List<ManufacturerResponse> list();

    List<String> listActiveNames();

    ManufacturerResponse create(ManufacturerRequest req);

    ManufacturerResponse update(Long id, ManufacturerRequest req);

    void delete(Long id);
}
