package com.bank.account.application.mapper;

import com.bank.account.application.dto.BankAccountRequest;
import com.bank.account.application.dto.BankAccountResponse;
import com.bank.account.domain.BankAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BankAccountMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "balance", source = "initialDeposit")
    BankAccount toEntity(BankAccountRequest request);

    BankAccountResponse toResponse(BankAccount entity);
}






