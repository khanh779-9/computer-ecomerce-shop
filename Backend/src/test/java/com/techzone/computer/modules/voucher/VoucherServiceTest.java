package com.techzone.computer.modules.voucher;

import com.techzone.computer.modules.voucher.entity.Voucher;
import com.techzone.computer.modules.voucher.repository.VoucherRepository;
import com.techzone.computer.modules.voucher.service.VoucherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    private VoucherServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new VoucherServiceImpl(voucherRepository);
    }

    @Test
    void validateRejectsBlankCode() {
        var result = service.validate("  ", 100000L);

        assertFalse(result.isValid());
        assertTrue(result.getMessage().contains("nhập mã"));
    }

    @Test
    void validateRejectsMissingVoucher() {
        when(voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue("missing"))
                .thenReturn(Optional.empty());

        var result = service.validate(" missing ", 100000L);

        assertFalse(result.isValid());
        assertTrue(result.getMessage().contains("không tồn tại"));
    }

    @Test
    void validateRejectsOrderBelowMinimum() {
        Voucher voucher = voucher(100000L, 10, 500000L, false);
        when(voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue("SAVE10"))
                .thenReturn(Optional.of(voucher));

        var result = service.validate("SAVE10", 499999L);

        assertFalse(result.isValid());
        assertTrue(result.getMessage().contains("500000"));
    }

    @Test
    void validateUsesPercentageDiscountAndFreeShipping() {
        Voucher voucher = voucher(0L, 10, 0L, true);
        voucher.setCode("SAVE10");
        when(voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue("save10"))
                .thenReturn(Optional.of(voucher));

        var result = service.validate("save10", 500000L);

        assertTrue(result.isValid());
        assertEquals(50000L, result.getDiscountAmount());
        assertTrue(result.getIsFreeShip());
    }

    @Test
    void validateCapsDiscountAtOrderAmount() {
        Voucher voucher = voucher(1000000L, 0, 0L, false);
        voucher.setCode("BIG");
        when(voucherRepository.findByCodeIgnoreCaseAndIsActiveTrue("BIG"))
                .thenReturn(Optional.of(voucher));

        var result = service.validate("BIG", 300000L);

        assertTrue(result.isValid());
        assertEquals(300000L, result.getDiscountAmount());
    }

    private Voucher voucher(Long discountAmount, Integer discountPercent,
                            Long minOrderAmount, boolean freeShipping) {
        Voucher voucher = new Voucher();
        voucher.setCode("SAVE10");
        voucher.setDescription("Test voucher");
        voucher.setDiscountAmount(discountAmount);
        voucher.setDiscountPercent(discountPercent);
        voucher.setMinOrderAmount(minOrderAmount);
        voucher.setIsFreeShip(freeShipping);
        voucher.setIsActive(true);
        return voucher;
    }
}
