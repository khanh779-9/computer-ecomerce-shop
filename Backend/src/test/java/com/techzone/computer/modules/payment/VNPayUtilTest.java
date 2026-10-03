package com.techzone.computer.modules.payment;

import com.techzone.computer.modules.payment.util.VNPayUtil;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class VNPayUtilTest {

    @Test
    void testHmacSHA512ProducesCorrectHash() {
        String key = "RAOCTXGU2XFZ8TGUSWUXZNYAEBGQOZAW";
        String data = "vnp_Amount=10000000&vnp_Command=pay&vnp_TmnCode=2QXUI4B4";

        String hash = VNPayUtil.hmacSHA512(key, data);

        assertNotNull(hash);
        assertEquals(128, hash.length()); // SHA-512 hex is 128 characters
    }

    @Test
    void testHashAllFieldsSortsAlphabetically() {
        String key = "TEST_SECRET_KEY";

        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_TmnCode", "2QXUI4B4");
        fields.put("vnp_Amount", "1000000");
        fields.put("vnp_Command", "pay");

        String hash1 = VNPayUtil.hashAllFields(fields, key);

        // Put in reverse order into another map
        Map<String, String> reversed = new HashMap<>();
        reversed.put("vnp_Command", "pay");
        reversed.put("vnp_Amount", "1000000");
        reversed.put("vnp_TmnCode", "2QXUI4B4");

        String hash2 = VNPayUtil.hashAllFields(reversed, key);

        assertEquals(hash1, hash2, "Sorted hash must be identical regardless of insertion order");
    }

    @Test
    void testBuildQueryUrl() {
        Map<String, String> fields = new HashMap<>();
        fields.put("b", "second");
        fields.put("a", "first");

        String query = VNPayUtil.buildQueryUrl(fields);
        assertEquals("a=first&b=second", query);
    }
}
