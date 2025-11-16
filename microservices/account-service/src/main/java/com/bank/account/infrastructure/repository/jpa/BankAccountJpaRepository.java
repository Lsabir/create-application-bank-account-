package com.bank.account.infrastructure.repository.jpa;

import com.bank.account.domain.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountJpaRepository extends JpaRepository<BankAccount, Long> {
}






