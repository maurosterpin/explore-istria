package com.example.pula_go.repository

import com.example.pula_go.model.RoutePlanRating
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RoutePlanUpvoteRepository : JpaRepository<RoutePlanRating, Long> {
    fun findByUserId(userId: Long): List<RoutePlanRating>
    fun findByRoutePlanIdAndUserId(routePlanId: Long, userId: Long): RoutePlanRating?
}

