package com.bank.document.application.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DocumentResponse {
    Long id;
    String ownerName;
    String type;
    String path;
}






