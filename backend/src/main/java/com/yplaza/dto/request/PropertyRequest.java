package main.java.com.yplaza.dto.request;

import com.yplaza.entity.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;


/**
 * formulaire pour la création / modification de biens immo
 */


@Data
public class PropertyRequest {
    @NotBlank
    private String title;
    private String description;

    @NotNull
    private PropertyType type;

    @NotNull
    @Positive
    private BigDecimal price;

    @Positive
    private Double surface;
    private Integer rooms;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer floor;
    private Boolean hasParking;
    private Boolean hasGarden;
    private Boolean hasBalcony;
    private Boolean hasElevator;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    private String zipCode;
    private Double latitude;
    private Double longitude;

    @NotNull
    private Long agencyId;
}
