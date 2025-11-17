package com.bank.document.application;

import com.bank.document.application.dto.DocumentRequest;
import com.bank.document.application.dto.DocumentResponse;
import com.bank.document.application.mapper.DocumentMapper;
import com.bank.document.domain.DocumentFile;
import com.bank.document.domain.port.DocumentRepositoryPort;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentApplicationService {

    private final DocumentRepositoryPort repository;
    private final DocumentMapper mapper;

    @Transactional
    public DocumentResponse save(DocumentRequest request) {
        DocumentFile entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> list() {
        return repository.findAll().stream().map(mapper::toResponse).collect(Collectors.toList());
    }
}








