package com.bank.account.infrastructure.rest;

import com.bank.account.application.AccountApplicationService;
import com.bank.account.application.dto.BankAccountRequest;
import com.bank.account.application.dto.BankAccountResponse;
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
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts")
public class AccountController {

    private final AccountApplicationService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BankAccountResponse open(@RequestBody @Valid BankAccountRequest request) {
        return service.openAccount(request);
    }

    @GetMapping
    public List<BankAccountResponse> list() {
        return service.listAccounts();
    }
}






