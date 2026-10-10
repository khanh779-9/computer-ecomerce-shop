package com.techzone.computer.modules.brand.service;

import com.techzone.computer.modules.brand.dto.BrandRequest;
import com.techzone.computer.modules.brand.dto.BrandResponse;

import java.util.List;

public interface BrandService {

    List<BrandResponse> list();

    List<String> listNames();

    BrandResponse create(BrandRequest req);

    BrandResponse update(Long id, BrandRequest req);

    void delete(Long id);
}
