package com.techzone.computer.modules.order;

import com.techzone.computer.modules.order.util.OrderTotals;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OrderTotalsTest {

    @Test
    void freeShippingAtThreshold() {
        assertEquals(500000, OrderTotals.calculate(500000, 0, false));
        assertEquals(0, OrderTotals.shippingFee(500000));
    }

    @Test
    void shippingBelowThreshold() {
        assertEquals(430000, OrderTotals.calculate(400000, 0, false));
        assertEquals(30000, OrderTotals.shippingFee(499999));
        assertEquals(0, OrderTotals.calculate(470000, 0, false));
    }

    @Test
    void discountReducesPayableButKeepsShipping() {
        assertEquals(430000 - 50000, OrderTotals.calculate(430000, 50000, false));
    }

    @Test
    void freeShipVoucherRemovesShippingFee() {
        assertEquals(400000, OrderTotals.calculate(400000, 0, true));
    }

    @Test
    void discountIsCappedAtSubtotal() {
        assertEquals(0, OrderTotals.calculate(100000, 999999, false));
        assertEquals(0, OrderTotals.calculate(100000, 999999, true));
    }
}
