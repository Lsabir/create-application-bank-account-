package com.bank.document.infrastructure.rest;

import com.bank.document.application.DocumentApplicationService;
import com.bank.document.application.dto.DocumentRequest;
import com.bank.document.application.dto.DocumentResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "Documents")
public class DocumentController {

    private final DocumentApplicationService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse create(@RequestBody @Valid DocumentRequest request) {
        return service.save(request);
    }

    @GetMapping
    public List<DocumentResponse> list() {
        return service.list();
    }
}






