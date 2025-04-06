package com.example.pula_go.repository

import com.example.pula_go.model.RouteComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface RouteCommentRepository : JpaRepository<RouteComment, Long> {
    fun findByRoutePlanId(routePlanId: Long): List<RouteComment>

    @Query("SELECT COUNT(c) FROM RouteComment c WHERE c.routePlan.id = :routePlanId")
    fun countByRoutePlanId(@Param("routePlanId") routePlanId: Long): Long
}
