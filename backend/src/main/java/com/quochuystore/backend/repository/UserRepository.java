package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findFirstByRole(UserRole role);

    @Modifying
    @Query("UPDATE User u SET u.totalSpent = u.totalSpent + :amount WHERE u.id = :userId")
    int increaseTotalSpent(@Param("userId") UUID userId, @Param("amount") BigDecimal amount);

    @Modifying
    @Query(value = "UPDATE users u SET total_spent = COALESCE((SELECT SUM(o.total_price) FROM orders o WHERE o.user_id = u.id AND o.status = 'DELIVERED'), 0)", nativeQuery = true)
    int recalculateAllUsersTotalSpent();

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true AND u.totalSpent >= :minTotalSpent ORDER BY u.totalSpent DESC")
    List<User> findTargetUsersForBroadcast(@Param("role") UserRole role, @Param("minTotalSpent") BigDecimal minTotalSpent);
}
