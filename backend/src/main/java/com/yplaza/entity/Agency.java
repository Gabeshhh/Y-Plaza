package com.yplaza.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une agence du réseau Y-Plaza.
 * Y-Plaza possède 1 siège (Aix-en-Provence) + 12 agences sur le territoire.
 */
@Entity
@Table(name = "agencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false)
    private String city;

    @Column
    private String address;

    @Column
    private String zipCode;

    @Column
    private String phone;

    @Column
    private String email;

    /** Siège social à Aix-en-Provence */
    @Column(nullable = false)
    private boolean headquarters = false;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @JsonIgnore
    @OneToMany(mappedBy = "agency", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<User> users = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "agency", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Property> properties = new ArrayList<>();
}
