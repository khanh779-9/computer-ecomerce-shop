package com.techzone.computer.modules.warranty.service;

import com.techzone.computer.modules.warranty.dto.AdminWarrantyRow;
import com.techzone.computer.modules.warranty.dto.ClaimStatusRequest;
import com.techzone.computer.modules.warranty.dto.RepairEventRequest;
import com.techzone.computer.modules.warranty.dto.SerialRegisterRequest;
import com.techzone.computer.modules.warranty.dto.WarrantyClaimRequest;
import com.techzone.computer.modules.warranty.dto.WarrantyLookupItem;

import java.util.List;

public interface WarrantyService {

    List<WarrantyLookupItem> lookup(String query);

    List<WarrantyLookupItem> myWarranties(Long customerId);

    WarrantyLookupItem createClaim(Long customerId, WarrantyClaimRequest req);

    List<AdminWarrantyRow> adminListWarranties();

    AdminWarrantyRow adminRegisterSerial(SerialRegisterRequest req);

    AdminWarrantyRow adminUpdateClaimStatus(Long claimId, ClaimStatusRequest req);

    AdminWarrantyRow adminAddRepairEvent(Long claimId, RepairEventRequest req);
}
