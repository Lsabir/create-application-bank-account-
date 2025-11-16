package com.bank.account.application;

import com.bank.account.application.dto.BankAccountRequest;
import com.bank.account.application.dto.BankAccountResponse;
import com.bank.account.application.mapper.BankAccountMapper;
import com.bank.account.domain.BankAccount;
import com.bank.account.domain.port.BankAccountRepositoryPort;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountApplicationService {

    private final BankAccountRepositoryPort repositoryPort;
    private final BankAccountMapper mapper;

    @Transactional
    public BankAccountResponse openAccount(BankAccountRequest request) {
        BankAccount entity = mapper.toEntity(request);
        return mapper.toResponse(repositoryPort.save(entity));
    }

    @Transactional(readOnly = true)
    public List<BankAccountResponse> listAccounts() {
        return repositoryPort.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}






