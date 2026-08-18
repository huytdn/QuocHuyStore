package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.UserVoucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, UUID> {

    Optional<UserVoucher> findByUserIdAndVoucherId(UUID userId, UUID voucherId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT uv FROM UserVoucher uv WHERE uv.user.id = :userId AND uv.voucher.id = :voucherId")
    Optional<UserVoucher> findByUserIdAndVoucherIdForUpdate(@Param("userId") UUID userId, @Param("voucherId") UUID voucherId);

    @Query("SELECT uv FROM UserVoucher uv WHERE uv.user.id = :userId AND uv.voucher.id IN :voucherIds")
    List<UserVoucher> findByUserIdAndVoucherIdIn(@Param("userId") UUID userId, @Param("voucherIds") Collection<UUID> voucherIds);

    @Query("SELECT uv FROM UserVoucher uv WHERE uv.user.id = :userId AND UPPER(uv.voucher.code) = UPPER(:code)")
    Optional<UserVoucher> findByUserIdAndVoucherCode(@Param("userId") UUID userId, @Param("code") String code);
}
