package com.techzone.computer.modules.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewCreateRequest(
    @NotNull(message = "Mã sản phẩm không được để trống")
    Long productId,

    Long orderId,

    @NotNull(message = "Vui lòng chọn số sao đánh giá (1-5)")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    Integer rating,

    @Size(max = 200, message = "Tiêu đề không vượt quá 200 ký tự")
    String title,

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    @Size(min = 5, max = 2000, message = "Nội dung đánh giá từ 5 đến 2000 ký tự")
    String content,

    String userName
) {}
