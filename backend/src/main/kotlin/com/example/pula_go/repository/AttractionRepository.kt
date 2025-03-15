package com.example.pula_go.repository

import com.example.pula_go.model.Attraction
import com.example.pula_go.model.Category
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional


@Repository
interface AttractionRepository : JpaRepository<Attraction, Long> {

    @Modifying
    @Transactional
    @Query(value = "TRUNCATE TABLE attractions RESTART IDENTITY", nativeQuery = true)
    fun truncateTable()

    @Query(
        value = "SELECT a FROM Attraction a " +
            "WHERE (:city IS NULL OR a.city = :city) " +
            "AND (:category IS NULL OR a.category = :category) " +
            "ORDER BY a.id ASC"
    )
    fun findAllByCustomParams(
        @Param("category") category: Category?,
        @Param("city") city: String?,
    ): List<Attraction?>?

}
