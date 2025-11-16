package com.bank.document.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocumentRequest {
    @NotBlank
    private String ownerName;
    @NotBlank
    private String type;
    @NotBlank
    private String path;
}






