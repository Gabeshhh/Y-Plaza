// contrôleur REST -> endpoints public 
package com.yplaza.controller;

import com.yplaza.dto.response.ApiResponse;
import com.yplaza.entity.Agency;
import com.yplaza.exception.ResourceNotFoundException;
import com.yplaza.repository.AgencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agencies")
@RequiredArgsConstructor
public class AgencyController {

    private final AgencyRepository agencyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Agency>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(agencyRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Agency>> getById(@PathVariable Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agence", id));
        return ResponseEntity.ok(ApiResponse.success(agency));
    }
}
