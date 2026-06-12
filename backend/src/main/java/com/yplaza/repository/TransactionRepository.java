package main.java.com.yplaza.repository;

import com.yplaza.entity.Transaction;
import com.yplaza.entity.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByBuyerId(Long buyerId, Pageable pageable);
    Page<Transaction> findByCommercialId(Long commercialId, Pageable pageable);
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);

    /** Chiffre d'affaires total par agence */
    @Query("SELECT t.commercial.agency.id, SUM(t.agreedPrice), COUNT(t) " +
           "FROM Transaction t WHERE t.status = 'ACTE_DEFINITIF' " +
           "GROUP BY t.commercial.agency.id")
    List<Object[]> getRevenueByAgency();

    /** Total des ventes finalisées */
    @Query("SELECT SUM(t.agreedPrice) FROM Transaction t WHERE t.status = 'ACTE_DEFINITIF'")
    BigDecimal getTotalRevenue();

    /** Nombre de transactions par statut */
    @Query("SELECT t.status, COUNT(t) FROM Transaction t GROUP BY t.status")
    List<Object[]> countByStatus();

    /** Transactions récentes */
    List<Transaction> findTop10ByOrderByCreatedAtDesc();

    boolean existsByPropertyIdAndBuyerId(@Param("propertyId") Long propertyId,
                                          @Param("buyerId") Long buyerId);
}
