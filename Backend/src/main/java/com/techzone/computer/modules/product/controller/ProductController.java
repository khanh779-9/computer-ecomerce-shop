package com.techzone.computer.modules.product.controller;

import com.techzone.computer.modules.product.dto.ProductImageResponse;
import com.techzone.computer.modules.product.dto.ProductImageUploadResponse;
import com.techzone.computer.modules.product.dto.ProductResponse;
import com.techzone.computer.modules.product.dto.ProductUpsertRequest;
import com.techzone.computer.modules.product.service.ProductImageService;
import com.techzone.computer.modules.product.service.ProductImageStorageService;
import com.techzone.computer.modules.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;
    private final ProductImageService productImageService;
    private final ProductImageStorageService imageStorageService;

    @GetMapping
    public List<ProductResponse> find(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category
    ) {
        return service.find(search, category);
    }

    @GetMapping("/trending-searches")
    public List<String> getTrendingSearches() {
        return service.getTrendingSearches();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return service.getCategories();
    }

    @GetMapping("/bestsellers")
    public List<ProductResponse> getBestSellers() {
        return service.getBestSellers();
    }

    @GetMapping("/latest")
    public List<ProductResponse> getLatestProducts() {
        return service.getLatestProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductUpsertRequest req) {
        return service.create(req);
    }

    @PostMapping("/images")
    public ProductImageUploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        return imageStorageService.upload(file);
    }

    @GetMapping("/{id}/images")
    public List<ProductImageResponse> listImages(@PathVariable Long id) {
        return productImageService.listByProduct(id);
    }

    @PostMapping("/{id}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText
    ) {
        return productImageService.uploadAndSave(id, file, altText);
    }

    @PatchMapping("/{id}/images/{imageId}/primary")
    public ProductImageResponse setImagePrimary(@PathVariable Long id, @PathVariable Long imageId) {
        return productImageService.setPrimary(id, imageId);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProductImage(@PathVariable Long id, @PathVariable Long imageId) {
        productImageService.delete(id, imageId);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpsertRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
