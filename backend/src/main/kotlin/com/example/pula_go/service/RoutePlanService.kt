package com.example.pula_go.service

import com.example.pula_go.model.RoutePlan
import com.example.pula_go.repository.RoutePlanRepository
import org.springframework.stereotype.Service

@Service
class RoutePlanService(
    private val routePlanRepository: RoutePlanRepository
) {

    fun createRoutePlan(routePlan: RoutePlan): RoutePlan {
        return routePlanRepository.save(routePlan)
    }

    fun getRoutePlans(
        sortBy: String?,
        category: String?,
        city: String?
    ): List<RoutePlan> {
        var routes = routePlanRepository.findAll()

        category?.let {
            routes = routes.filter { it.category?.equals(category, ignoreCase = true) == true }
        }

        city?.let {
            routes = routes.filter { it.city?.equals(city, ignoreCase = true) == true }
        }

        return when (sortBy?.toLowerCase()) {
            "most upvoted" -> routes.sortedByDescending { it.upvotes }
            else -> routes.sortedByDescending { it.id }
        }
    }

    fun upvoteRoutePlan(id: Long): RoutePlan? {
        val routePlan = routePlanRepository.findById(id).orElse(null)
        routePlan?.let {
            it.upvotes += 1
            routePlanRepository.save(it)
        }
        return routePlan
    }
}
