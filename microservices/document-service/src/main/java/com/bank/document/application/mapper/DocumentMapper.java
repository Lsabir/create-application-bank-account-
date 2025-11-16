package com.bank.document.application.mapper;

import com.bank.document.application.dto.DocumentRequest;
import com.bank.document.application.dto.DocumentResponse;
import com.bank.document.domain.DocumentFile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentMapper {
    @Mapping(target = "id", ignore = true)
    DocumentFile toEntity(DocumentRequest request);

    DocumentResponse toResponse(DocumentFile entity);
}






