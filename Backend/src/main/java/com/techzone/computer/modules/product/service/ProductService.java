package com.techzone.computer.modules.product.service;

import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.dto.ProductUpsertRequest;

import java.util.List;

public interface ProductService {
    List<ProductResponse> find(String q, String category);
    ProductResponse get(Long id);
    ProductResponse create(ProductUpsertRequest req);
    ProductResponse update(Long id, ProductUpsertRequest req);
    void delete(Long id);
    ProductResponse deductStock(Long id, Integer quantity);
    List<String> getTrendingSearches();
    void recordSearch(String query);
}
