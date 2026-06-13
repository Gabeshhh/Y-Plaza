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

    /**
     * Prédictions et tendances marché.
     * Algorithme basé sur : activité par ville, part de marché par type,
     * taux de vente et estimation de durée de vente.
     */
    public Map<String, Object> getPredictions() {
        Map<String, Object> predictions = new LinkedHashMap<>();

        // 1. Zones d'investissement recommandées
        List<Map<String, Object>> cityData = getPriceByCity();
        if (!cityData.isEmpty()) {
            double maxCount = cityData.stream()
                    .mapToDouble(c -> ((Number) c.get("count")).doubleValue()).max().orElse(1);
            double maxPrice = cityData.stream()
                    .mapToDouble(c -> ((Number) c.get("averagePrice")).doubleValue()).max().orElse(1);
            double minPrice = cityData.stream()
                    .mapToDouble(c -> ((Number) c.get("averagePrice")).doubleValue()).min().orElse(0);

            List<Map<String, Object>> zones = new ArrayList<>();
            for (Map<String, Object> city : cityData) {
                double count = ((Number) city.get("count")).doubleValue();
                double avgPrice = ((Number) city.get("averagePrice")).doubleValue();
                double priceRange = maxPrice - minPrice > 0 ? maxPrice - minPrice : 1;
                // Score : activité élevée + prix modéré = investissement attractif
                double score = (count / maxCount) * 60.0 + ((maxPrice - avgPrice) / priceRange) * 40.0;
                int scoreInt = (int) Math.round(score);
                String label = scoreInt >= 70 ? "Excellent" : scoreInt >= 50 ? "Très bon" : scoreInt >= 30 ? "Bon" : "Modéré";
                Map<String, Object> zone = new LinkedHashMap<>(city);
                zone.put("potentialScore", scoreInt);
                zone.put("potentialLabel", label);
                zone.put("recommendation", scoreInt >= 50
                        ? "Zone à fort potentiel d'investissement"
                        : "Zone stable, rendement modéré");
                zones.add(zone);
            }
            zones.sort((a, b) -> Integer.compare(
                    ((Number) b.get("potentialScore")).intValue(),
                    ((Number) a.get("potentialScore")).intValue()));
            predictions.put("topInvestmentZones", zones.stream().limit(5).toList());
        } else {
            predictions.put("topInvestmentZones", List.of());
        }

        // 2. Demande par type de bien
        List<Map<String, Object>> typeData = getPriceByType();
        long totalActive = propertyRepository.countByActiveTrue();
        List<Map<String, Object>> demandByType = new ArrayList<>();
        for (Map<String, Object> type : typeData) {
            long count = ((Number) type.get("count")).longValue();
            double marketShare = totalActive > 0 ? (double) count / totalActive * 100 : 0;
            String demandLabel = count >= 4 ? "Forte demande" : count >= 2 ? "Demande modérée" : "Demande faible";
            String trend = count >= 3 ? "↑" : count == 2 ? "→" : "↓";
            Map<String, Object> entry = new LinkedHashMap<>(type);
            entry.put("marketShare", Math.round(marketShare * 10.0) / 10.0);
            entry.put("demandLabel", demandLabel);
            entry.put("trend", trend);
            demandByType.add(entry);
        }
        demandByType.sort((a, b) -> Long.compare(
                ((Number) b.get("count")).longValue(),
                ((Number) a.get("count")).longValue()));
        predictions.put("demandByType", demandByType);

        // 3. Aperçu du marché
        long sold = propertyRepository.countByActiveTrueAndSoldTrue();
        double saleRate = totalActive > 0 ? (double) sold / totalActive * 100 : 0;
        double estimatedMonths = Math.max(1.0, 12.0 - (saleRate / 10.0));

        Map<String, Object> market = new LinkedHashMap<>();
        market.put("totalActive", totalActive);
        market.put("totalSold", sold);
        market.put("saleRate", Math.round(saleRate * 10.0) / 10.0);
        market.put("marketTrend", saleRate > 30 ? "Marché vendeur" : saleRate > 10 ? "Marché équilibré" : "Marché acheteur");
        market.put("trendIcon", saleRate > 30 ? "📈" : saleRate > 10 ? "⚖️" : "📉");
        market.put("trendColor", saleRate > 30 ? "#10b981" : saleRate > 10 ? "#f59e0b" : "#3b82f6");
        market.put("estimatedMonthsToSell", Math.round(estimatedMonths * 10.0) / 10.0);
        market.put("marketHealth", saleRate > 20 ? "Dynamique" : "Stable");
        predictions.put("marketOverview", market);

        // 4. Transactions par mois (activité récente)
        Map<String, Long> txByStatus = new LinkedHashMap<>();
        transactionRepository.countByStatus().forEach(row ->
                txByStatus.put(row[0].toString(), (Long) row[1]));
        long totalTx = txByStatus.values().stream().mapToLong(Long::longValue).sum();
        long completedTx = txByStatus.getOrDefault("ACTE_DEFINITIF", 0L);
        double conversionRate = totalTx > 0 ? (double) completedTx / totalTx * 100 : 0;

        Map<String, Object> txStats = new LinkedHashMap<>();
        txStats.put("total", totalTx);
        txStats.put("completed", completedTx);
        txStats.put("conversionRate", Math.round(conversionRate * 10.0) / 10.0);
        txStats.put("conversionLabel", conversionRate > 50 ? "Excellent" : conversionRate > 25 ? "Bon" : "À améliorer");
        predictions.put("transactionInsights", txStats);

        return predictions;
    }
}
