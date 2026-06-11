package main.java.com.yplaza.dto.response;

import com.yplaza.entity.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

 /**
   * DTO représentant un bien immobilier retourné par l'API.
   * Remplace l'entité JPA Property pour éviter les boucles de sérialisation
   * et contrôler précisément les données exposées au client.
   */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private PropertyType type;
    private BigDecimal price;
    private Double surface;
    private Integer rooms;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer floor;
    private Boolean hasParking;
    private Boolean hasGarden;
    private Boolean hasBalcony;
    private Boolean hasElevator;
    private String address;
    private String city;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    private boolean active;
    private boolean sold;
    private Integer views;
    private LocalDateTime createdAt;
    private String agencyName;
    private Long agencyId;
    private String commercialName;
    private Long commercialId;
}
