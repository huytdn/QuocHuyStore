package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Voucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, UUID>, JpaSpecificationExecutor<Voucher> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Voucher v WHERE UPPER(v.code) = UPPER(:code)")
    Optional<Voucher> findByCodeIgnoreCaseForUpdate(@Param("code") String code);

    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.isHidden = false AND v.startAt <= :now AND v.endAt >= :now ORDER BY v.createdAt DESC")
    List<Voucher> findActivePublicVouchers(@Param("now") OffsetDateTime now);

    @Query("SELECT v FROM Voucher v WHERE " +
            "(:isActive IS NULL OR v.isActive = :isActive) AND " +
            "(CAST(:search AS string) IS NULL OR :search = '' OR LOWER(v.code) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%') OR LOWER(v.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%'))")
    Page<Voucher> findAdminVouchers(@Param("isActive") Boolean isActive, @Param("search") String search, Pageable pageable);
}
