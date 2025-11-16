package com.bank.document.infrastructure.repository;

import com.bank.document.domain.DocumentFile;
import com.bank.document.domain.port.DocumentRepositoryPort;
import com.bank.document.infrastructure.repository.jpa.DocumentJpaRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DocumentRepositoryAdapter implements DocumentRepositoryPort {

    private final DocumentJpaRepository jpaRepository;

    @Override
    public DocumentFile save(DocumentFile document) {
        return jpaRepository.save(document);
    }

    @Override
    public List<DocumentFile> findAll() {
        return jpaRepository.findAll();
    }
}






