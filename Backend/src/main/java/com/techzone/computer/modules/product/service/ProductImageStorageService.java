package com.techzone.computer.modules.product.service;

import com.techzone.computer.modules.product.dto.ProductImageUploadResponse;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@Service
public class ProductImageStorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final MinioClient minioClient;
    private final String endpoint;
    private final String bucket;

    public ProductImageStorageService(
            MinioClient minioClient,
            @Value("${MINIO_ENDPOINT:http://localhost:9000}") String endpoint,
            @Value("${MINIO_BUCKET:computer-shop-storage}") String bucket
    ) {
        this.minioClient = minioClient;
        this.endpoint = endpoint.replaceAll("/$", "");
        this.bucket = bucket;
    }

    public ProductImageUploadResponse upload(MultipartFile file) {
        validate(file);

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extensionOf(originalName);
        String objectName = "products/" + UUID.randomUUID() + extension;

        try {
            ensureBucket();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return new ProductImageUploadResponse(endpoint + "/" + bucket + "/" + objectName, objectName);
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tải ảnh sản phẩm lên MinIO", e);
        }
    }

    private void ensureBucket() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }

        String policy = """
                {
                  "Version": "2012-10-17",
                  "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": ["arn:aws:s3:::%s/*"]
                  }]
                }
                """.formatted(bucket);
        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build()
        );
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn một ảnh sản phẩm");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Ảnh sản phẩm không được vượt quá 10 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận tệp hình ảnh");
        }
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0) return "";
        String extension = filename.substring(dot).toLowerCase(Locale.ROOT);
        return extension.matches("\\.(jpg|jpeg|png|webp|gif|avif)") ? extension : "";
    }
}
