package com.yplaza.service;

import com.yplaza.dto.request.PropertyRequest;
import com.yplaza.dto.response.PropertyResponse;
import com.yplaza.entity.*;
import com.yplaza.exception.BadRequestException;
import com.yplaza.exception.ResourceNotFoundException;
import com.yplaza.repository.AgencyRepository;
import com.yplaza.repository.PropertyRepository;
import com.yplaza.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service de gestion des biens immobiliers.
 * Respecte le principe ISP : interfaces séparées par responsabilité.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final AgencyRepository agencyRepository;
    private final UserRepository userRepository;

    /** Recherche paginée avec filtres */
    public Page<PropertyResponse> searchProperties(
            String city, PropertyType type,
            BigDecimal minPrice, BigDecimal maxPrice,
            Double minSurface, Pageable pageable) {

        return propertyRepository.searchProperties(city, type, minPrice, maxPrice, minSurface, pageable)
                .map(this::toResponse);
    }

    /** Récupère un bien par ID et incrémente les vues */
    @Transactional
    public PropertyResponse getById(Long id) {
        Property property = findOrThrow(id);
        property.setViews(property.getViews() == null ? 1 : property.getViews() + 1);
        return toResponse(property);
    }

    /** Création d'un bien */
    @Transactional
    public PropertyResponse create(PropertyRequest request, String commercialEmail) {
        Agency agency = agencyRepository.findById(request.getAgencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Agence", request.getAgencyId()));

        User commercial = userRepository.findByEmail(commercialEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .price(request.getPrice())
                .surface(request.getSurface())
                .rooms(request.getRooms())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .floor(request.getFloor())
                .hasParking(request.getHasParking())
                .hasGarden(request.getHasGarden())
                .hasBalcony(request.getHasBalcony())
                .hasElevator(request.getHasElevator())
                .address(request.getAddress())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .agency(agency)
                .commercial(commercial)
                .views(0)
                .build();

        return toResponse(propertyRepository.save(property));
    }

    /** Mise à jour d'un bien */
    @Transactional
    public PropertyResponse update(Long id, PropertyRequest request) {
        Property property = findOrThrow(id);

        Agency agency = agencyRepository.findById(request.getAgencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Agence", request.getAgencyId()));

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setType(request.getType());
        property.setPrice(request.getPrice());
        property.setSurface(request.getSurface());
        property.setRooms(request.getRooms());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setFloor(request.getFloor());
        property.setHasParking(request.getHasParking());
        property.setHasGarden(request.getHasGarden());
        property.setHasBalcony(request.getHasBalcony());
        property.setHasElevator(request.getHasElevator());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setZipCode(request.getZipCode());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setAgency(agency);

        return toResponse(propertyRepository.save(property));
    }

    /** Suppression logique */
    @Transactional
    public void delete(Long id) {
        Property property = findOrThrow(id);
        property.setActive(false);
        propertyRepository.save(property);
    }

    /** Biens populaires */
    public List<PropertyResponse> getTopProperties(int limit) {
        return propertyRepository.findTopByViews(Pageable.ofSize(limit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Property findOrThrow(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));
    }

    /** Mapper Entity → DTO (DRY : méthode réutilisée partout) */
    public PropertyResponse toResponse(Property p) {
        return PropertyResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .type(p.getType())
                .price(p.getPrice())
                .surface(p.getSurface())
                .rooms(p.getRooms())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .floor(p.getFloor())
                .hasParking(p.getHasParking())
                .hasGarden(p.getHasGarden())
                .hasBalcony(p.getHasBalcony())
                .hasElevator(p.getHasElevator())
                .address(p.getAddress())
                .city(p.getCity())
                .zipCode(p.getZipCode())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .active(p.isActive())
                .sold(p.isSold())
                .views(p.getViews())
                .createdAt(p.getCreatedAt())
                .agencyName(p.getAgency() != null ? p.getAgency().getName() : null)
                .agencyId(p.getAgency() != null ? p.getAgency().getId() : null)
                .commercialName(p.getCommercial() != null ? p.getCommercial().getFullName() : null)
                .commercialId(p.getCommercial() != null ? p.getCommercial().getId() : null)
                .build();
    }
}
