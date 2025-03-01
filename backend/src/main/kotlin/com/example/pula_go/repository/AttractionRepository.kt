package com.example.pula_go.repository

import com.example.pula_go.model.Attraction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
interface AttractionRepository : JpaRepository<Attraction, Long> {

    @Modifying
    @Transactional
    @Query(value = "TRUNCATE TABLE attractions RESTART IDENTITY", nativeQuery = true)
    fun truncateTable()
}
