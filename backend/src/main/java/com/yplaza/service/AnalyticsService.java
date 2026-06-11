package com.yplaza.service;

import com.yplaza.repository.PropertyRepository;
import com.yplaza.repository.TransactionRepository;
import com.yplaza.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service d'analyse de données immobilières.
 * Fournit statistiques, tendances marché et prévisions basiques.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PropertyRepository propertyRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    /** Tableau de bord direction */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalProperties", propertyRepository.countByActiveTrue());
        stats.put("soldProperties", propertyRepository.countByActiveTrueAndSoldTrue());
        stats.put("totalUsers", userRepository.count());

        // Revenus totaux
        var totalRevenue = transactionRepository.getTotalRevenue();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0);

        // Statuts transactions
        Map<String, Long> txByStatus = new LinkedHashMap<>();
        transactionRepository.countByStatus().forEach(row ->
                txByStatus.put(row[0].toString(), (Long) row[1]));
        stats.put("transactionsByStatus", txByStatus);

        return stats;
    }

    /** Prix moyen par ville — zone intéressante pour investir */
    public List<Map<String, Object>> getPriceByCity() {
        List<Map<String, Object>> result = new ArrayList<>();
        propertyRepository.getAveragePriceByCity().forEach(row -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("city", row[0]);
            entry.put("averagePrice", row[1]);
            entry.put("count", row[2]);
            result.add(entry);
        });
        return result;
    }

    /** Prix moyen par type de bien */
    public List<Map<String, Object>> getPriceByType() {
        List<Map<String, Object>> result = new ArrayList<>();
        propertyRepository.getAveragePriceByType().forEach(row -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("type", row[0].toString());
            entry.put("averagePrice", row[1]);
            entry.put("count", row[2]);
            result.add(entry);
        });
        return result;
    }

    /** Chiffre d'affaires par agence */
    public List<Map<String, Object>> getRevenueByAgency() {
        List<Map<String, Object>> result = new ArrayList<>();
        transactionRepository.getRevenueByAgency().forEach(row -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("agencyId", row[0]);
            entry.put("totalRevenue", row[1]);
            entry.put("count", row[2]);
            result.add(entry);
        });
        return result;
    }

    /** Biens populaires */
    public List<Map<String, Object>> getTopProperties() {
        List<Map<String, Object>> result = new ArrayList<>();
        propertyRepository.findTopByViews(
                org.springframework.data.domain.Pageable.ofSize(10)
        ).forEach(p -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", p.getId());
            entry.put("title", p.getTitle());
            entry.put("city", p.getCity());
            entry.put("price", p.getPrice());
            entry.put("views", p.getViews());
            result.add(entry);
        });
        return result;
    }
}
