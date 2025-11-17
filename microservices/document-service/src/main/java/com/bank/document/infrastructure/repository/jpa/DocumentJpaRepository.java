package com.bank.document.infrastructure.repository.jpa;

import com.bank.document.domain.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentJpaRepository extends JpaRepository<DocumentFile, Long> {
}








