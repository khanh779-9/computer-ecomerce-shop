package com.techzone.computer.modules.product.service;

import com.techzone.computer.modules.product.dto.ProductImageResponse;
import com.techzone.computer.modules.product.dto.ProductImageUploadResponse;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.entity.ProductImage;
import com.techzone.computer.modules.product.repository.ProductImageRepository;
import com.techzone.computer.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductImageStorageService storageService;
    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;

    /**
     * Tải một ảnh lên MinIO rồi lưu bản ghi vào bảng product_images.
     * Ảnh đầu tiên của sản phẩm tự động trở thành ảnh chính (is_primary).
     */
    @Transactional
    public ProductImageResponse uploadAndSave(Long productId, MultipartFile file, String altText) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm ID: " + productId));

        ProductImageUploadResponse uploaded = storageService.upload(file);
        boolean makePrimary = imageRepository.countByProductId(productId) == 0;

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(uploaded.url())
                .objectKey(uploaded.objectName())
                .altText(altText != null && !altText.isBlank() ? altText : product.getName())
                .sortOrder(nextSortOrder(productId))
                .isPrimary(makePrimary)
                .build();
        image = imageRepository.save(image);

        // Đồng bộ ảnh chính về products.image_url để tương thích ngược với catalogue cũ
        if (makePrimary) {
            product.setImageUrl(uploaded.url());
            productRepository.save(product);
        }

        return ProductImageResponse.from(image);
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> listByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new NoSuchElementException("Không tìm thấy sản phẩm ID: " + productId);
        }
        return imageRepository.findByProductIdOrderBySortOrderAscIdAsc(productId)
                .stream()
                .map(ProductImageResponse::from)
                .toList();
    }

    /**
     * Lưu URL ảnh chính khi tạo/cập nhật sản phẩm — ghi bản ghi product_images tương ứng.
     */
    @Transactional
    public void syncPrimaryImage(Product product, String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        ProductImage existing = imageRepository
                .findFirstByProductIdOrderByIsPrimaryDescSortOrderAscIdAsc(product.getId())
                .orElse(null);

        if (existing != null && imageUrl.equals(existing.getImageUrl())) {
            return;
        }

        if (existing != null) {
            existing.setIsPrimary(false);
            imageRepository.save(existing);
        }

        String objectKey = extractObjectKey(imageUrl);
        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .objectKey(objectKey)
                .altText(product.getName())
                .sortOrder(nextSortOrder(product.getId()))
                .isPrimary(true)
                .build();
        imageRepository.save(image);
    }

    @Transactional
    public ProductImageResponse setPrimary(Long productId, Long imageId) {
        ProductImage image = imageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy ảnh ID: " + imageId + " của sản phẩm " + productId));

        imageRepository.findByProductIdOrderBySortOrderAscIdAsc(productId).forEach(img -> {
            img.setIsPrimary(img.getId().equals(imageId));
            imageRepository.save(img);
        });

        Product product = image.getProduct();
        product.setImageUrl(image.getImageUrl());
        productRepository.save(product);

        return ProductImageResponse.from(image);
    }

    @Transactional
    public void delete(Long productId, Long imageId) {
        ProductImage image = imageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy ảnh ID: " + imageId + " của sản phẩm " + productId));
        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());
        imageRepository.delete(image);
        imageRepository.flush();

        if (wasPrimary) {
            imageRepository.findFirstByProductIdOrderByIsPrimaryDescSortOrderAscIdAsc(productId).ifPresent(next -> {
                next.setIsPrimary(true);
                imageRepository.save(next);
                Product product = next.getProduct();
                product.setImageUrl(next.getImageUrl());
                productRepository.save(product);
            });
        }
    }

    private Integer nextSortOrder(Long productId) {
        return (int) imageRepository.countByProductId(productId);
    }

    private String extractObjectKey(String url) {
        if (url == null) return null;
        int bucketIdx = url.indexOf("/products/");
        return bucketIdx >= 0 ? url.substring(bucketIdx + 1) : url;
    }
}
