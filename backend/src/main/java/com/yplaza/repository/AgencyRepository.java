package com.yplaza.repository;

import com.yplaza.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
    List<Agency> findByHeadquarters(boolean headquarters);
    Optional<Agency> findByCity(String city);
    List<Agency> findByCityContainingIgnoreCase(String city);
}
