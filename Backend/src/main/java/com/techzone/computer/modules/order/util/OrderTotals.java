package com.techzone.computer.modules.order.util;

public final class OrderTotals {

    private OrderTotals() {}

    public static long calculate(long subtotal) {
        // Miá»…n phÃ­ váº­n chuyá»ƒn cho Ä‘Æ¡n hÃ ng tá»« 500.000Ä‘ trá»Ÿ lÃªn, dÆ°á»›i 500k phá»¥ thu 30.000Ä‘
        return subtotal + (subtotal >= 500000L ? 0L : 30000L);
    }
}
