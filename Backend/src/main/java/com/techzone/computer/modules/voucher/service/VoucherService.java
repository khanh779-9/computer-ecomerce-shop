package com.techzone.computer.modules.voucher.service;

import com.techzone.computer.modules.voucher.dto.VoucherUpsertRequest;
import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.entity.Voucher;

import java.util.List;

public interface VoucherService {

    List<Voucher> getActiveVouchers();

    List<Voucher> getAllVouchers();

    VoucherValidationResult validate(String code, Long orderAmount);

    Voucher create(VoucherUpsertRequest req);

    Voucher update(Long id, VoucherUpsertRequest req);

    Voucher setActive(Long id, Boolean isActive);

    void delete(Long id);
}
