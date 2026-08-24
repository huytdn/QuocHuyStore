package com.quochuystore.backend.controller;

import com.quochuystore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final UserService userService;

    @PostMapping("/recalculate-all-spent")
    public ResponseEntity<Map<String, Object>> recalculateAllUsersTotalSpent() {
        log.info("REST request by ADMIN to recalculate total spent for all users");
        int updatedCount = userService.recalculateAllUsersTotalSpent();
        return ResponseEntity.ok(Map.of(
                "message", "Successfully recalculated total spent for all users",
                "affectedUsers", updatedCount
        ));
    }
}
