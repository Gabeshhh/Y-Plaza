package com.yplaza.controller;

import com.yplaza.dto.response.ApiResponse;
import com.yplaza.entity.Role;
import com.yplaza.entity.Transaction;
import com.yplaza.entity.TransactionStatus;
import com.yplaza.entity.User;
import com.yplaza.repository.UserRepository;
import com.yplaza.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Gère les demandes d'achats / de biens
 */

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Transaction>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Transaction> result;
        if (user.getRole() == Role.DIRECTION || user.getRole() == Role.IT_SUPPORT) {
            result = transactionService.getAll(pageable);
        } else if (user.getRole() == Role.COMMERCIAL) {
            result = transactionService.getByCommercial(user.getId(), pageable);
        } else {
            result = transactionService.getByBuyer(user.getId(), pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<Transaction>> createTransaction(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Transaction tx = transactionService.createTransaction(propertyId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Demande d'achat initiée", tx));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Transaction>> updateStatus(
            @PathVariable Long id,
            @RequestParam TransactionStatus status) {
        Transaction tx = transactionService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Statut mis à jour", tx));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getStats()));
    }
}
