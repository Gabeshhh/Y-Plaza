package com.yplaza.repository;

import com.yplaza.entity.Property;
import com.yplaza.entity.PropertyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    /** Recherche paginée avec filtres multiples */
    @Query("SELECT p FROM Property p WHERE p.active = true AND p.sold = false " +
           "AND (cast(:city as string) IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', cast(:city as string), '%'))) " +
           "AND (:type IS NULL OR p.type = :type) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minSurface IS NULL OR p.surface >= :minSurface)")
    Page<Property> searchProperties(
            @Param("city") String city,
            @Param("type") PropertyType type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minSurface") Double minSurface,
            Pageable pageable);

    /** Top biens populaires par vues */
    @Query("SELECT p FROM Property p WHERE p.active = true ORDER BY p.views DESC")
    List<Property> findTopByViews(Pageable pageable);

    /** Biens par agence */
    Page<Property> findByAgencyIdAndActiveTrue(Long agencyId, Pageable pageable);

    /** Prix moyen par ville */
    @Query("SELECT p.city, AVG(p.price), COUNT(p) FROM Property p " +
           "WHERE p.active = true GROUP BY p.city ORDER BY COUNT(p) DESC")
    List<Object[]> getAveragePriceByCity();

    /** Prix moyen par type */
    @Query("SELECT p.type, AVG(p.price), COUNT(p) FROM Property p " +
           "WHERE p.active = true GROUP BY p.type")
    List<Object[]> getAveragePriceByType();

    /** Comptage biens actifs */
    long countByActiveTrue();
    long countByActiveTrueAndSoldTrue();

    /** Biens du commercial */
    Page<Property> findByCommercialId(Long commercialId, Pageable pageable);
}
