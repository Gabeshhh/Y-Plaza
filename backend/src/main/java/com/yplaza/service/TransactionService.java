package com.yplaza.service;

import com.yplaza.dto.response.ApiResponse;
import com.yplaza.entity.*;
import com.yplaza.exception.BadRequestException;
import com.yplaza.exception.ResourceNotFoundException;
import com.yplaza.repository.PropertyRepository;
import com.yplaza.repository.TransactionRepository;
import com.yplaza.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /** Initie une demande d'achat */
    @Transactional
    public Transaction createTransaction(Long propertyId, String buyerEmail) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", propertyId));

        if (property.isSold()) {
            throw new BadRequestException("Ce bien est déjà vendu");
        }

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (transactionRepository.existsByPropertyIdAndBuyerId(propertyId, buyer.getId())) {
            throw new BadRequestException("Une transaction est déjà en cours pour ce bien");
        }

        Transaction transaction = Transaction.builder()
                .property(property)
                .buyer(buyer)
                .commercial(property.getCommercial())
                .agreedPrice(property.getPrice())
                .status(TransactionStatus.EN_ATTENTE)
                .build();

        return transactionRepository.save(transaction);
    }

    /** Met à jour le statut d'une transaction */
    @Transactional
    public Transaction updateStatus(Long transactionId, TransactionStatus newStatus) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));

        transaction.setStatus(newStatus);

        if (newStatus == TransactionStatus.ACTE_DEFINITIF) {
            transaction.setCompletedAt(LocalDateTime.now());
            transaction.getProperty().setSold(true);
            propertyRepository.save(transaction.getProperty());
        }

        return transactionRepository.save(transaction);
    }

    public Page<Transaction> getAll(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }

    public Page<Transaction> getByBuyer(Long buyerId, Pageable pageable) {
        return transactionRepository.findByBuyerId(buyerId, pageable);
    }

    public Page<Transaction> getByCommercial(Long commercialId, Pageable pageable) {
        return transactionRepository.findByCommercialId(commercialId, pageable);
    }

    /** Statistiques transactions */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        BigDecimal total = transactionRepository.getTotalRevenue();
        stats.put("totalRevenue", total != null ? total : BigDecimal.ZERO);

        Map<String, Long> byStatus = new HashMap<>();
        transactionRepository.countByStatus().forEach(row -> {
            byStatus.put(((TransactionStatus) row[0]).name(), (Long) row[1]);
        });
        stats.put("byStatus", byStatus);
        stats.put("recent", transactionRepository.findTop10ByOrderByCreatedAtDesc());
        return stats;
    }
}
