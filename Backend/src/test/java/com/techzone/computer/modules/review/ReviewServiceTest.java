package com.techzone.computer.modules.review;

import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.entity.OrderItem;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.review.dto.ReviewCreateRequest;
import com.techzone.computer.modules.review.entity.Review;
import com.techzone.computer.modules.review.repository.ReviewRepository;
import com.techzone.computer.modules.review.service.ReviewServiceImpl;
import com.techzone.computer.modules.user.entity.Customer;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
    @Mock ReviewRepository reviewRepository;
    @Mock ProductRepository productRepository;
    @Mock CustomerRepository customerRepository;
    @Mock OrderRepository orderRepository;

    @Test void summaryDefaultsToFiveWhenThereAreNoRatings() {
        when(reviewRepository.countByProductIdAndStatus(1L, "APPROVED")).thenReturn(0L);
        when(reviewRepository.getAverageRatingByProductId(1L)).thenReturn(null);
        when(reviewRepository.countRatingsByStar(1L)).thenReturn(List.of());

        var result = service().getProductReviewSummary(1L);

        assertEquals(5.0, result.averageRating());
        assertEquals(0L, result.totalReviews());
        assertEquals(0L, result.ratingCounts().get(1));
        assertEquals(0L, result.ratingCounts().get(5));
    }

    @Test void createReviewMarksVerifiedPurchaseAddsPointsAndRecalculatesProduct() {
        Product product = Product.builder().id(1L).name("Laptop").build();
        Customer user = Customer.builder().id(7L).fullName("Buyer").points(100).build();
        Order order = new Order();
        order.setUserId(7L);
        OrderItem item = new OrderItem();
        item.setProductId(1L);
        order.setItems(List.of(item));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findById(7L)).thenReturn(Optional.of(user));
        when(orderRepository.findById(9L)).thenReturn(Optional.of(order));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review review = inv.getArgument(0);
            review.setId(4L);
            return review;
        });
        when(reviewRepository.countByProductIdAndStatus(1L, "APPROVED")).thenReturn(1L);
        when(reviewRepository.getAverageRatingByProductId(1L)).thenReturn(4.6);

        var result = service().createReview(
                new ReviewCreateRequest(1L, 9L, 5, " Great ", "  Works well  ", null), 7L);

        assertEquals("Buyer", result.userName());
        assertTrue(result.isVerifiedPurchase());
        assertEquals(150, user.getPoints());
        assertEquals(1, product.getReviewCount());
        assertEquals(4.6, product.getRating());
        verify(productRepository).save(product);
    }

    @Test void createReviewRejectsUnknownProduct() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> service().createReview(new ReviewCreateRequest(99L, null, 4, null, "Good", null), null));
        verifyNoInteractions(reviewRepository);
    }

    @Test void likeReviewIncrementsLikes() {
        Review review = Review.builder().id(3L).productId(1L).rating(4)
                .content("Good").likesCount(2).build();
        when(reviewRepository.findById(3L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);

        var result = service().likeReview(3L);

        assertEquals(3, result.likesCount());
        verify(reviewRepository).save(review);
    }

    private ReviewServiceImpl service() {
        return new ReviewServiceImpl(reviewRepository, productRepository, customerRepository, orderRepository);
    }
}
