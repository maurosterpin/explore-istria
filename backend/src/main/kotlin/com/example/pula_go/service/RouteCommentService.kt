package com.example.pula_go.service

import com.example.pula_go.model.RouteComment
import com.example.pula_go.repository.RouteCommentRepository
import com.example.pula_go.repository.RoutePlanRepository
import org.springframework.stereotype.Service

@Service
class RouteCommentService(
    private val routeCommentRepository: RouteCommentRepository,
    private val routePlanRepository: RoutePlanRepository,
) {
    fun addComment(routePlanId: Long, comment: String, rating: Double): RouteComment? {
        val routePlan = routePlanRepository.findById(routePlanId).orElse(null) ?: return null

        val newComment = RouteComment(
            comment = comment,
            routePlan = routePlan,
            rating = rating,
            userId = 1,
            username = ""
        )

        return routeCommentRepository.save(newComment)
    }

    fun getComments(routePlanId: Long): List<RouteComment> {
        return routeCommentRepository.findByRoutePlanId(routePlanId)
    }
}
