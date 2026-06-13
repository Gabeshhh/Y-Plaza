/* 
    Authentification   
    Gère la connexion et l'inscription  

    via : 
    - /api/auth/rergister 
    - /api/auth/login 
*/
package com.yplaza.controller;

import com.yplaza.dto.request.LoginRequest;
import com.yplaza.dto.request.RegisterRequest;
import com.yplaza.dto.response.ApiResponse;
import com.yplaza.dto.response.AuthResponse;
import com.yplaza.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur d'authentification — inscription et connexion.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Compte créé avec succès", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Connexion réussie", response));
    }
}
