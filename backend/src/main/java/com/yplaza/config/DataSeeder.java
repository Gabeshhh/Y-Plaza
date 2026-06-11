<<<<<<< HEAD
// Crée en db : 13 agences - 5 utilisateyrs - 10 biens immo 

=======
<<<<<<< HEAD
// Crée en db : 13 agences - 5 utilisateyrs - 10 biens immo 

=======
>>>>>>> kaaption
>>>>>>> main
package com.yplaza.config;

import com.yplaza.entity.*;
import com.yplaza.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Initialisation des données de démonstration.
 * Création du siège + 12 agences + comptes de test.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final AgencyRepository agencyRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (agencyRepository.count() > 0) {
            log.info("Base de données déjà initialisée, skip seeding.");
            return;
        }

        log.info("Initialisation des données Y-Plaza...");

        // === AGENCES ===
        Agency siege = agencyRepository.save(Agency.builder()
                .name("Y-Plaza Siège Social")
                .city("Aix-en-Provence")
                .address("15 Cours Mirabeau")
                .zipCode("13100")
                .phone("04 42 00 00 00")
                .email("siege@yplaza.fr")
                .headquarters(true)
                .latitude(43.5263)
                .longitude(5.4452)
                .build());

        List<String[]> agenciesData = List.of(
            new String[]{"Y-Plaza Paris", "Paris", "75001", "01 00 00 00 01"},
            new String[]{"Y-Plaza Lyon", "Lyon", "69001", "04 72 00 00 01"},
            new String[]{"Y-Plaza Marseille", "Marseille", "13001", "04 91 00 00 01"},
            new String[]{"Y-Plaza Bordeaux", "Bordeaux", "33000", "05 56 00 00 01"},
            new String[]{"Y-Plaza Toulouse", "Toulouse", "31000", "05 61 00 00 01"},
            new String[]{"Y-Plaza Nice", "Nice", "06000", "04 93 00 00 01"},
            new String[]{"Y-Plaza Nantes", "Nantes", "44000", "02 40 00 00 01"},
            new String[]{"Y-Plaza Strasbourg", "Strasbourg", "67000", "03 88 00 00 01"},
            new String[]{"Y-Plaza Montpellier", "Montpellier", "34000", "04 67 00 00 01"},
            new String[]{"Y-Plaza Rennes", "Rennes", "35000", "02 99 00 00 01"},
            new String[]{"Y-Plaza Lille", "Lille", "59000", "03 20 00 00 01"},
            new String[]{"Y-Plaza Grenoble", "Grenoble", "38000", "04 76 00 00 01"}
        );

        List<Agency> agencies = agenciesData.stream().map(d -> agencyRepository.save(
                Agency.builder()
                        .name(d[0]).city(d[1]).zipCode(d[2]).phone(d[3])
                        .email("contact@yplaza-" + d[1].toLowerCase() + ".fr")
                        .headquarters(false)
                        .build()
        )).toList();

        // === UTILISATEURS ===
        User admin = userRepository.save(User.builder()
                .firstName("Sophie").lastName("Martin")
                .email("admin@yplaza.fr")
                .password(passwordEncoder.encode("Admin123!"))
                .role(Role.DIRECTION)
                .agency(siege)
                .build());

        User itSupport = userRepository.save(User.builder()
                .firstName("Thomas").lastName("Bernard")
                .email("it@yplaza.fr")
                .password(passwordEncoder.encode("Admin123!"))
                .role(Role.IT_SUPPORT)
                .agency(siege)
                .build());

        User commercial1 = userRepository.save(User.builder()
                .firstName("Lucas").lastName("Dupont")
                .email("commercial@yplaza.fr")
                .password(passwordEncoder.encode("Admin123!"))
                .role(Role.COMMERCIAL)
                .agency(agencies.get(0))
                .build());

        User commercial2 = userRepository.save(User.builder()
                .firstName("Emma").lastName("Leroy")
                .email("emma.leroy@yplaza.fr")
                .password(passwordEncoder.encode("Admin123!"))
                .role(Role.COMMERCIAL)
                .agency(agencies.get(8))
                .build());

        User client = userRepository.save(User.builder()
                .firstName("Gabriel").lastName("Durand")
                .email("client@yplaza.fr")
                .password(passwordEncoder.encode("Admin123!"))
                .role(Role.CLIENT)
                .build());

        // === BIENS ===
        List<Object[]> propertiesData = List.of(
            new Object[]{"Appartement T3 Haussmannien", PropertyType.APPARTEMENT, new BigDecimal("485000"), 78.0, 3, "Paris", agencies.get(0), commercial1},
            new Object[]{"Maison avec jardin et piscine", PropertyType.MAISON, new BigDecimal("620000"), 145.0, 5, "Lyon", agencies.get(1), commercial1},
            new Object[]{"Studio vue mer", PropertyType.STUDIO, new BigDecimal("195000"), 28.0, 1, "Nice", agencies.get(5), commercial1},
            new Object[]{"Villa provençale", PropertyType.VILLA, new BigDecimal("1250000"), 280.0, 6, "Aix-en-Provence", siege, commercial2},
            new Object[]{"Appartement T2 moderne", PropertyType.APPARTEMENT, new BigDecimal("265000"), 55.0, 2, "Montpellier", agencies.get(8), commercial2},
            new Object[]{"Local commercial centre-ville", PropertyType.LOCAL_COMMERCIAL, new BigDecimal("380000"), 120.0, 1, "Bordeaux", agencies.get(3), commercial1},
            new Object[]{"Maison familiale 4 chambres", PropertyType.MAISON, new BigDecimal("395000"), 165.0, 5, "Toulouse", agencies.get(4), commercial2},
            new Object[]{"Appartement T4 vue fleuve", PropertyType.APPARTEMENT, new BigDecimal("545000"), 95.0, 4, "Nantes", agencies.get(6), commercial1},
            new Object[]{"Bureau open-space", PropertyType.BUREAU, new BigDecimal("890000"), 320.0, null, "Paris", agencies.get(0), commercial1},
            new Object[]{"Terrain constructible", PropertyType.TERRAIN, new BigDecimal("180000"), 800.0, null, "Strasbourg", agencies.get(7), commercial2}
        );

        propertiesData.forEach(d -> propertyRepository.save(Property.builder()
                .title((String) d[0])
                .type((PropertyType) d[1])
                .price((BigDecimal) d[2])
                .surface((Double) d[3])
                .rooms((Integer) d[4])
                .city((String) d[5])
                .address("1 Rue Exemple")
                .zipCode("00000")
                .agency((Agency) d[6])
                .commercial((User) d[7])
                .views((int) (Math.random() * 500))
                .description("Magnifique bien immobilier proposé par Y-Plaza. Idéalement situé avec toutes commodités à proximité.")
                .hasParking(true)
                .hasBalcony(true)
                .build()));

        log.info("Données initialisées : 13 agences, 5 utilisateurs, 10 biens");
        log.info("Comptes de test :");
        log.info("  admin@yplaza.fr / Admin123! (DIRECTION)");
        log.info("  it@yplaza.fr / Admin123! (IT_SUPPORT)");
        log.info("  commercial@yplaza.fr / Admin123! (COMMERCIAL)");
        log.info("  client@yplaza.fr / Admin123! (CLIENT)");
    }
}
