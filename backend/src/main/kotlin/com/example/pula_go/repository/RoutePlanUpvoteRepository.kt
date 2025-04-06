package com.example.pula_go.repository

import com.example.pula_go.model.RoutePlanUpvote
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RoutePlanUpvoteRepository : JpaRepository<RoutePlanUpvote, Long> {
    fun findByRoutePlanIdAndUserId(routePlanId: Long, userId: Long): RoutePlanUpvote?
}

