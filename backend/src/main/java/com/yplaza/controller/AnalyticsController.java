/* 
    Statistiques 

*/

package main.java.com.yplaza.controller;

import com.yplaza.dto.response.ApiResponse;
import com.yplaza.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Endpoints d'analyse de données — accès réservé Direction et IT.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DIRECTION', 'IT_SUPPORT')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }

    @GetMapping("/price-by-city")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPriceByCity() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPriceByCity()));
    }

    @GetMapping("/price-by-type")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPriceByType() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPriceByType()));
    }

    @GetMapping("/revenue-by-agency")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenueByAgency() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueByAgency()));
    }

    @GetMapping("/top-properties")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopProperties() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTopProperties()));
    }
}
