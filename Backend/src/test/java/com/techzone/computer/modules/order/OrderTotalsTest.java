package com.techzone.computer.modules.order;

import com.techzone.computer.modules.order.util.OrderTotals;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OrderTotalsTest {

    @Test
    void freeShippingAtThreshold() {
        assertEquals(500000, OrderTotals.calculate(500000));
    }

    @Test
    void shippingBelowThreshold() {
        assertEquals(430000, OrderTotals.calculate(400000));
        assertEquals(500000, OrderTotals.calculate(500000 - 30000));
    }
}
