package com.example.pula_go.service

import com.example.pula_go.model.RoutePlan
import com.example.pula_go.model.RoutePlanUpvote
import com.example.pula_go.repository.RouteCommentRepository
import com.example.pula_go.repository.RoutePlanRepository
import com.example.pula_go.repository.RoutePlanUpvoteRepository
import org.springframework.stereotype.Service

data class RoutePlanResponse(
    val id: Long,
    val name: String,
    val description: String,
    val category: String?,
    val city: String?,
    val attractionIds: String,
    val upvotes: Int,
    val userId: Long,
    val commentCount: Long
)

@Service
class RoutePlanService(
    private val routePlanRepository: RoutePlanRepository,
    private val routePlanUpvoteRepository: RoutePlanUpvoteRepository,
    private val routeCommentRepository: RouteCommentRepository,
) {

    fun createRoutePlan(routePlan: RoutePlan): RoutePlan {
        return routePlanRepository.save(routePlan)
    }

    fun getRoutePlans(
        sortBy: String?,
        category: String?,
        city: String?
    ): List<RoutePlanResponse> {
        var routes = routePlanRepository.findAll()

        category?.let { cat ->
            routes = routes.filter { it.category?.equals(cat, ignoreCase = true) == true }
        }
        city?.let { ct ->
            routes = routes.filter { it.city?.equals(ct, ignoreCase = true) == true }
        }

        val sortedRoutes = when (sortBy?.toLowerCase()) {
            "most upvoted" -> routes.sortedByDescending { it.upvotes }
            else -> routes.sortedByDescending { it.id }
        }

        return sortedRoutes.map { route ->
            val commentCount = routeCommentRepository.countByRoutePlanId(route.id)
            RoutePlanResponse(
                id = route.id,
                name = route.name,
                description = route.description,
                category = route.category,
                city = route.city,
                attractionIds = route.attractionIds,
                upvotes = route.upvotes,
                userId = route.userId,
                commentCount = commentCount
            )
        }
    }


    fun upvoteRoutePlan(id: Long, userId: Long): RoutePlan {
        val routePlan = routePlanRepository.findById(id).orElseThrow {
            IllegalArgumentException("Route plan not found")
        }
        val existingVote = routePlanUpvoteRepository.findByRoutePlanIdAndUserId(id, userId)
        if (existingVote != null) {
            throw IllegalArgumentException("User has already upvoted this route")
        }
        val vote = RoutePlanUpvote(
            routePlan = routePlan,
            userId = userId
        )
        routePlanUpvoteRepository.save(vote)
        routePlan.upvotes += 1
        return routePlanRepository.save(routePlan)
    }
}
