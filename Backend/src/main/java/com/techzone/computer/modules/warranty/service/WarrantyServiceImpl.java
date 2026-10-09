package com.techzone.computer.modules.warranty.service;

import com.techzone.computer.modules.order.entity.Order;
import com.techzone.computer.modules.order.repository.OrderRepository;
import com.techzone.computer.modules.product.entity.Product;
import com.techzone.computer.modules.product.repository.ProductRepository;
import com.techzone.computer.modules.user.entity.Customer;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import com.techzone.computer.modules.warranty.dto.AdminWarrantyRow;
import com.techzone.computer.modules.warranty.dto.ClaimStatusRequest;
import com.techzone.computer.modules.warranty.dto.RepairEventRequest;
import com.techzone.computer.modules.warranty.dto.RepairStepDto;
import com.techzone.computer.modules.warranty.dto.SerialRegisterRequest;
import com.techzone.computer.modules.warranty.dto.WarrantyClaimRequest;
import com.techzone.computer.modules.warranty.dto.WarrantyLookupItem;
import com.techzone.computer.modules.warranty.entity.ProductSerial;
import com.techzone.computer.modules.warranty.entity.Warranty;
import com.techzone.computer.modules.warranty.entity.WarrantyClaim;
import com.techzone.computer.modules.warranty.entity.WarrantyRepairEvent;
import com.techzone.computer.modules.warranty.repository.ProductSerialRepository;
import com.techzone.computer.modules.warranty.repository.WarrantyClaimRepository;
import com.techzone.computer.modules.warranty.repository.WarrantyRepairEventRepository;
import com.techzone.computer.modules.warranty.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarrantyServiceImpl implements WarrantyService {

    private static final DateTimeFormatter PURCHASE_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ProductSerialRepository serialRepository;
    private final WarrantyRepository warrantyRepository;
    private final WarrantyClaimRepository claimRepository;
    private final WarrantyRepairEventRepository eventRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    // =============== PUBLIC LOOKUP ===============

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyLookupItem> lookup(String query) {
        String q = query == null ? "" : query.trim();
        if (q.isEmpty()) {
            return List.of();
        }
        return assemble(serialRepository.searchBySerialOrPhoneOrRma(q));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyLookupItem> myWarranties(Long customerId) {
        return assemble(serialRepository.findWithDetailsByCustomerId(customerId));
    }

    // =============== CUSTOMER CLAIM ===============

    @Override
    @Transactional
    public WarrantyLookupItem createClaim(Long customerId, WarrantyClaimRequest req) {
        ProductSerial serial = serialRepository.findBySerialNumberIgnoreCase(req.serialNumber().trim())
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy số serial '" + req.serialNumber() + "' trong hệ thống"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản khách hàng"));

        if (serial.getCustomer() == null || !customerId.equals(serial.getCustomer().getId())) {
            throw new IllegalArgumentException(
                    "Serial này không thuộc tài khoản của bạn. Vui lòng liên hệ hotline để được hỗ trợ.");
        }

        Warranty warranty = warrantyRepository.findBySerialId(serial.getId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Serial này chưa được kích hoạt bảo hành trong hệ thống"));

        Instant now = Instant.now();
        if (Warranty.STATUS_EXPIRED.equals(warranty.effectiveStatus(now))) {
            throw new IllegalStateException("Sản phẩm đã hết hạn bảo hành (đến "
                    + warranty.getExpiresAt() + "). Vui lòng liên hệ hotline để được hỗ trợ trả phí.");
        }

        boolean hasOpenClaim = warranty.getClaims().stream()
                .anyMatch(c -> !WarrantyClaim.STATUS_RESOLVED.equals(c.getStatus()));
        if (hasOpenClaim) {
            throw new IllegalStateException(
                    "Serial này đang có một yêu cầu bảo hành chưa hoàn tất (RMA đang xử lý).");
        }

        WarrantyClaim claim = WarrantyClaim.builder()
                .warranty(warranty)
                .rmaCode(generateRmaCode())
                .issue(req.issue().trim())
                .status(WarrantyClaim.STATUS_RECEIVED)
                .receivedAt(now)
                .build();
        claim = claimRepository.save(claim);

        WarrantyRepairEvent firstEvent = WarrantyRepairEvent.builder()
                .claim(claim)
                .stepOrder(1)
                .title("Tiếp nhận thiết bị")
                .description("Yêu cầu bảo hành đã được ghi nhận. Vui lòng mang thiết bị tới Showroom TechZone gần nhất hoặc gửi qua chuyển phát nhanh.")
                .eventAt(now)
                .completed(false)
                .build();
        eventRepository.save(firstEvent);

        warranty.setStatus(Warranty.STATUS_IN_REPAIR);
        warrantyRepository.save(warranty);

        return toLookupItem(serial, warranty, claim);
    }

    // =============== ADMIN MANAGEMENT ===============

    @Override
    @Transactional(readOnly = true)
    public List<AdminWarrantyRow> adminListWarranties() {
        List<ProductSerial> serials = serialRepository.findAllWithDetails();
        Map<Long, Warranty> warrantyBySerial = warrantyRepository.findAllWithClaims().stream()
                .collect(Collectors.toMap(w -> w.getSerial().getId(), Function.identity()));
        Map<Long, List<WarrantyRepairEvent>> eventsByClaim = loadEvents(
                warrantyBySerial.values().stream().flatMap(w -> w.getClaims().stream()).toList());

        return serials.stream()
                .map(serial -> toAdminRow(serial, warrantyBySerial.get(serial.getId()), eventsByClaim))
                .toList();
    }

    @Override
    @Transactional
    public AdminWarrantyRow adminRegisterSerial(SerialRegisterRequest req) {
        String serialNumber = req.serialNumber().trim();
        if (serialRepository.existsBySerialNumberIgnoreCase(serialNumber)) {
            throw new IllegalStateException("Số serial '" + serialNumber + "' đã tồn tại trong hệ thống");
        }

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm ID: " + req.productId()));

        Customer customer = null;
        if (req.customerEmail() != null && !req.customerEmail().isBlank()) {
            customer = customerRepository.findByEmail(req.customerEmail().trim()).orElse(null);
        }

        Order order = null;
        if (req.orderId() != null) {
            order = orderRepository.findById(req.orderId()).orElse(null);
        }

        Instant now = Instant.now();
        ProductSerial serial = ProductSerial.builder()
                .product(product)
                .serialNumber(serialNumber)
                .customer(customer)
                .order(order)
                .soldAt(now)
                .build();
        serial = serialRepository.save(serial);

        int months = req.warrantyMonths() != null && req.warrantyMonths() > 0 ? req.warrantyMonths() : 12;
        Warranty warranty = Warranty.builder()
                .serial(serial)
                .warrantyMonths(months)
                .startsAt(now)
                .expiresAt(now.plus(java.time.Duration.ofDays(months * 30L)))
                .status(Warranty.STATUS_ACTIVE)
                .build();
        warrantyRepository.save(warranty);

        return toAdminRow(serial, warranty, Map.of());
    }

    @Override
    @Transactional
    public AdminWarrantyRow adminUpdateClaimStatus(Long claimId, ClaimStatusRequest req) {
        WarrantyClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy yêu cầu bảo hành ID: " + claimId));

        String status = req.status().trim().toUpperCase();
        validateClaimStatus(status);

        claim.setStatus(status);
        if (WarrantyClaim.STATUS_RESOLVED.equals(status)) {
            claim.setResolvedAt(Instant.now());
        }
        claim = claimRepository.save(claim);

        Warranty warranty = claim.getWarranty();
        if (WarrantyClaim.STATUS_RESOLVED.equals(status)) {
            warranty.setStatus(Warranty.STATUS_READY_FOR_PICKUP);
        } else {
            warranty.setStatus(Warranty.STATUS_IN_REPAIR);
        }
        warrantyRepository.save(warranty);

        return toAdminRow(warranty.getSerial(), warranty, claim);
    }

    @Override
    @Transactional
    public AdminWarrantyRow adminAddRepairEvent(Long claimId, RepairEventRequest req) {
        WarrantyClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy yêu cầu bảo hành ID: " + claimId));

        int nextStep = eventRepository.findMaxStepOrder(claimId).orElse(0) + 1;
        WarrantyRepairEvent event = WarrantyRepairEvent.builder()
                .claim(claim)
                .stepOrder(nextStep)
                .title(req.title().trim())
                .description(req.description())
                .eventAt(Instant.now())
                .completed(Boolean.TRUE.equals(req.completed()))
                .build();
        eventRepository.save(event);

        claim.getEvents().add(event);
        Warranty warranty = claim.getWarranty();
        return toAdminRow(warranty.getSerial(), warranty, claim);
    }

    // =============== HELPERS ===============

    private List<WarrantyLookupItem> assemble(List<ProductSerial> serials) {
        if (serials.isEmpty()) {
            return List.of();
        }
        Map<Long, Warranty> warrantyBySerial = warrantyRepository
                .findBySerialIdsWithClaims(serials.stream().map(ProductSerial::getId).toList())
                .stream()
                .collect(Collectors.toMap(w -> w.getSerial().getId(), Function.identity()));
        Map<Long, List<WarrantyRepairEvent>> eventsByClaim = loadEvents(
                warrantyBySerial.values().stream().flatMap(w -> w.getClaims().stream()).toList());

        List<WarrantyLookupItem> items = new ArrayList<>();
        for (ProductSerial serial : serials) {
            Warranty warranty = warrantyBySerial.get(serial.getId());
            if (warranty == null) {
                continue;
            }
            WarrantyClaim latestClaim = warranty.getClaims().stream()
                    .max(java.util.Comparator.comparing(WarrantyClaim::getReceivedAt))
                    .orElse(null);
            items.add(toLookupItem(serial, warranty, latestClaim, eventsByClaim));
        }
        return items;
    }

    private Map<Long, List<WarrantyRepairEvent>> loadEvents(List<WarrantyClaim> claims) {
        if (claims.isEmpty()) {
            return Map.of();
        }
        return claimRepository.findByIdsWithEvents(claims.stream().map(WarrantyClaim::getId).toList())
                .stream()
                .collect(Collectors.toMap(c -> c.getId(), WarrantyClaim::getEvents));
    }

    private WarrantyLookupItem toLookupItem(ProductSerial serial, Warranty warranty, WarrantyClaim claim) {
        return toLookupItem(serial, warranty, claim, Map.of());
    }

    private WarrantyLookupItem toLookupItem(ProductSerial serial, Warranty warranty,
                                            WarrantyClaim claim, Map<Long, List<WarrantyRepairEvent>> eventsByClaim) {
        Product product = serial.getProduct();
        Customer customer = serial.getCustomer();

        List<RepairStepDto> timeline = null;
        String repairIssue = null;
        String claimStatus = null;
        if (claim != null) {
            repairIssue = claim.getIssue();
            claimStatus = claim.getStatus();
            timeline = (eventsByClaim.getOrDefault(claim.getId(), claim.getEvents())).stream()
                    .sorted(java.util.Comparator.comparing(WarrantyRepairEvent::getStepOrder))
                    .map(e -> new RepairStepDto(
                            String.valueOf(e.getStepOrder()),
                            e.getTitle(),
                            e.getDescription(),
                            e.getCompleted(),
                            e.getEventAt()))
                    .toList();
        }

        return new WarrantyLookupItem(
                serial.getSerialNumber(),
                customer != null ? customer.getFullName() : "Khách vãng lai",
                customer != null ? customer.getPhone() : null,
                product.getName(),
                product.getBrand(),
                product.getCategory(),
                serial.getSoldAt() != null
                        ? serial.getSoldAt().atZone(ZoneOffset.UTC).toLocalDate().format(PURCHASE_DATE_FORMAT)
                        : null,
                warranty.getWarrantyMonths(),
                warranty.getExpiresAt().atZone(ZoneOffset.UTC).toLocalDate().format(PURCHASE_DATE_FORMAT),
                warranty.effectiveStatus(Instant.now()),
                claim != null ? claim.getRmaCode() : null,
                repairIssue,
                claimStatus,
                timeline
        );
    }

    private AdminWarrantyRow toAdminRow(ProductSerial serial, Warranty warranty,
                                        Map<Long, List<WarrantyRepairEvent>> eventsByClaim) {
        WarrantyClaim latestClaim = warranty == null ? null : warranty.getClaims().stream()
                .max(java.util.Comparator.comparing(WarrantyClaim::getReceivedAt))
                .orElse(null);
        return toAdminRow(serial, warranty, latestClaim, eventsByClaim);
    }

    private AdminWarrantyRow toAdminRow(ProductSerial serial, Warranty warranty, WarrantyClaim claim) {
        return toAdminRow(serial, warranty, claim, Map.of());
    }

    private AdminWarrantyRow toAdminRow(ProductSerial serial, Warranty warranty,
                                        WarrantyClaim claim, Map<Long, List<WarrantyRepairEvent>> eventsByClaim) {
        Product product = serial.getProduct();
        Customer customer = serial.getCustomer();

        List<RepairStepDto> timeline = claim == null ? List.of() : (eventsByClaim.getOrDefault(claim.getId(), claim.getEvents())).stream()
                .sorted(java.util.Comparator.comparing(WarrantyRepairEvent::getStepOrder))
                .map(e -> new RepairStepDto(
                        String.valueOf(e.getStepOrder()),
                        e.getTitle(),
                        e.getDescription(),
                        e.getCompleted(),
                        e.getEventAt()))
                .toList();

        return new AdminWarrantyRow(
                warranty != null ? warranty.getId() : null,
                serial.getId(),
                serial.getSerialNumber(),
                product.getId(),
                product.getName(),
                product.getBrand(),
                customer != null ? customer.getId() : null,
                customer != null ? customer.getFullName() : null,
                customer != null ? customer.getEmail() : null,
                customer != null ? customer.getPhone() : null,
                warranty != null ? warranty.getStartsAt() : null,
                warranty != null ? warranty.getExpiresAt() : null,
                warranty != null ? warranty.getWarrantyMonths() : null,
                warranty != null ? warranty.effectiveStatus(Instant.now()) : null,
                claim != null ? claim.getId() : null,
                claim != null ? claim.getRmaCode() : null,
                claim != null ? claim.getIssue() : null,
                claim != null ? claim.getStatus() : null,
                claim != null ? claim.getReceivedAt() : null,
                claim != null ? claim.getResolvedAt() : null,
                timeline
        );
    }

    private String generateRmaCode() {
        int year = LocalDate.now().getYear();
        for (int attempt = 0; attempt < 20; attempt++) {
            String code = "RMA-" + year + "-" + String.format("%04d", RANDOM.nextInt(10000));
            if (!claimRepository.existsByRmaCode(code)) {
                return code;
            }
        }
        return "RMA-" + year + "-" + System.currentTimeMillis() % 1000000;
    }

    private void validateClaimStatus(String status) {
        boolean valid = WarrantyClaim.STATUS_RECEIVED.equals(status)
                || WarrantyClaim.STATUS_DIAGNOSED.equals(status)
                || WarrantyClaim.STATUS_REPAIRING.equals(status)
                || WarrantyClaim.STATUS_TESTING.equals(status)
                || WarrantyClaim.STATUS_RESOLVED.equals(status);
        if (!valid) {
            throw new IllegalArgumentException("Trạng thái claim không hợp lệ: " + status
                    + " (cho phép: RECEIVED, DIAGNOSED, REPAIRING, TESTING, RESOLVED)");
        }
    }
}
