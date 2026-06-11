package main.java.com.yplaza.dto.response;

import com.yplaza.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

 /**
   * DTO renvoyé au client après une authentification réussie (login ou register).
   * Contient le token JWT et les informations de profil nécessaires au frontend.
   */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private Long agencyId;
}
