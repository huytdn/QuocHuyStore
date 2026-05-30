package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Address;
import com.quochuystore.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByUser(User user);

    Page<Address> findByUser(User user, Pageable pageable);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user = :user AND a.isDefault = true")
    void resetDefaultByUser(@Param("user") User user);
}
