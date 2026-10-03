package com.techzone.computer.modules.order.util;

public final class OrderTotals {

    public static final long FREE_SHIP_THRESHOLD = 500000L;
    public static final long SHIPPING_FEE = 30000L;

    private OrderTotals() {}

    public static long shippingFee(long subtotal) {
        return subtotal >= FREE_SHIP_THRESHOLD ? 0L : SHIPPING_FEE;
    }

    public static long calculate(long subtotal, long discountAmount, boolean freeShip) {
        long payable = Math.max(0L, subtotal - Math.min(discountAmount, subtotal));
        long ship = freeShip ? 0L : shippingFee(subtotal);
        return payable + ship;
    }
}
