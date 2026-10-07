package com.techzone.computer.modules.order.repository;

import com.techzone.computer.modules.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_IdIn(Collection<Long> orderIds);
}
