package com.techzone.computer.modules.user.address.service;

import com.techzone.computer.modules.user.address.dto.AddressRequest;
import com.techzone.computer.modules.user.address.dto.AddressResponse;
import com.techzone.computer.modules.user.address.entity.CustomerAddress;
import com.techzone.computer.modules.user.address.repository.CustomerAddressRepository;
import com.techzone.computer.modules.user.entity.Customer;
import com.techzone.computer.modules.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final CustomerAddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> listMyAddresses(Long customerId) {
        return addressRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(customerId)
                .stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse create(Long customerId, AddressRequest req) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy khách hàng ID: " + customerId));

        CustomerAddress address = CustomerAddress.builder()
                .customer(customer)
                .label(req.label() != null && !req.label().isBlank() ? req.label() : "Nhà riêng")
                .recipientName(req.recipientName().trim())
                .phone(req.phone().trim())
                .addressLine(req.addressLine().trim())
                .province(req.province())
                .district(req.district())
                .ward(req.ward())
                .isDefault(Boolean.TRUE.equals(req.isDefault()) || addressRepository.countByCustomerId(customerId) == 0)
                .build();

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultForCustomer(customerId);
        }

        return AddressResponse.from(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse update(Long customerId, Long addressId, AddressRequest req) {
        CustomerAddress address = getOwnedAddress(customerId, addressId);

        address.setRecipientName(req.recipientName().trim());
        address.setPhone(req.phone().trim());
        address.setAddressLine(req.addressLine().trim());
        if (req.label() != null && !req.label().isBlank()) {
            address.setLabel(req.label());
        }
        address.setProvince(req.province());
        address.setDistrict(req.district());
        address.setWard(req.ward());

        if (Boolean.TRUE.equals(req.isDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultForCustomer(customerId);
            address.setIsDefault(true);
        }

        return AddressResponse.from(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void delete(Long customerId, Long addressId) {
        CustomerAddress address = getOwnedAddress(customerId, addressId);
        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);
        addressRepository.flush();

        if (wasDefault) {
            List<CustomerAddress> remaining = addressRepository
                    .findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(customerId);
            if (!remaining.isEmpty()) {
                CustomerAddress next = remaining.get(0);
                next.setIsDefault(true);
                addressRepository.save(next);
            }
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefault(Long customerId, Long addressId) {
        CustomerAddress address = getOwnedAddress(customerId, addressId);
        if (!Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultForCustomer(customerId);
            address.setIsDefault(true);
            address = addressRepository.save(address);
        }
        return AddressResponse.from(address);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getDefault(Long customerId) {
        return addressRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(customerId)
                .stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsDefault()))
                .findFirst()
                .or(() -> addressRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(customerId)
                        .stream()
                        .findFirst())
                .map(AddressResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Khách hàng chưa có địa chỉ nào"));
    }

    private CustomerAddress getOwnedAddress(Long customerId, Long addressId) {
        return addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy địa chỉ ID: " + addressId + " thuộc tài khoản của bạn"));
    }
}
