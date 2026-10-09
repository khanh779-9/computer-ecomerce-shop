package com.techzone.computer.modules.user.address.service;

import com.techzone.computer.modules.user.address.dto.AddressRequest;
import com.techzone.computer.modules.user.address.dto.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> listMyAddresses(Long customerId);

    AddressResponse create(Long customerId, AddressRequest req);

    AddressResponse update(Long customerId, Long addressId, AddressRequest req);

    void delete(Long customerId, Long addressId);

    AddressResponse setDefault(Long customerId, Long addressId);

    AddressResponse getDefault(Long customerId);
}
