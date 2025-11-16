package com.bank.document.domain.port;

import com.bank.document.domain.DocumentFile;
import java.util.List;

public interface DocumentRepositoryPort {
    DocumentFile save(DocumentFile document);
    List<DocumentFile> findAll();
}






