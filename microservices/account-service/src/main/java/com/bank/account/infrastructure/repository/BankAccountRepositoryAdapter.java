package com.bank.account.infrastructure.repository;

import com.bank.account.domain.BankAccount;
import com.bank.account.domain.port.BankAccountRepositoryPort;
import com.bank.account.infrastructure.repository.jpa.BankAccountJpaRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BankAccountRepositoryAdapter implements BankAccountRepositoryPort {

    private final BankAccountJpaRepository jpaRepository;

    @Override
    public BankAccount save(BankAccount account) {
        return jpaRepository.save(account);
    }

    @Override
    public Optional<BankAccount> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<BankAccount> findAll() {
        return jpaRepository.findAll();
    }
}






