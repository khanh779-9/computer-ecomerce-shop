package com.techzone.computer.modules.voucher.service;

import com.techzone.computer.modules.voucher.dto.VoucherValidationResult;
import com.techzone.computer.modules.voucher.entity.Voucher;

import java.util.List;

public interface VoucherService {

    List<Voucher> getActiveVouchers();

    VoucherValidationResult validate(String code, Long orderAmount);
}
