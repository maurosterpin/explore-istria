package com.example.pula_go.service

import com.example.pula_go.model.RoutePlan
import com.example.pula_go.model.RoutePlanUpvote
import com.example.pula_go.model.User
import com.example.pula_go.repository.RouteCommentRepository
import com.example.pula_go.repository.RoutePlanRepository
import com.example.pula_go.repository.RoutePlanUpvoteRepository
import com.example.pula_go.repository.UserRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
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
    val commentCount: Long,
    val images: List<String> = emptyList()
)

@Service
class RoutePlanService(
    private val routePlanRepository: RoutePlanRepository,
    private val routePlanUpvoteRepository: RoutePlanUpvoteRepository,
    private val routeCommentRepository: RouteCommentRepository,
    private val userRepository: UserRepository
) {

    fun createRoutePlan(routePlan: RoutePlan): RoutePlan {
        return routePlanRepository.save(routePlan)
    }

    fun createRouteWithImages(
        name: String,
        description: String,
        imagesList: List<String>
    ): RoutePlan {
        val objectMapper = jacksonObjectMapper()
        val imagesJson = objectMapper.writeValueAsString(imagesList)
        val routePlan = RoutePlan(
            name = name,
            description = description,
            category = "CULTURAL",
            city = "Pula",
            attractionIds = "1,2",
            upvotes = 0,
            userId = 1,
            images = imagesJson
        )
        return routePlanRepository.save(routePlan)
    }

    fun getRoutePlans(
        sortBy: String?,
        category: String?,
        city: String?
    ): List<RoutePlanResponse> {
        var routes = routePlanRepository.findAll()

        category?.let { cat ->
            routes = routes.filter { it.category?.contains(cat, ignoreCase = true) == true }
        }
        city?.let { ct ->
            routes = routes.filter { it.city?.equals(ct, ignoreCase = true) == true }
        }

        val sortedRoutes = when (sortBy?.toLowerCase()) {
            "most upvoted" -> routes.sortedByDescending { it.upvotes }
            else -> routes.sortedByDescending { it.id }
        }

        val objectMapper = jacksonObjectMapper()

        return sortedRoutes.map { route ->
            val imagesJson = route.images ?: "[]"
            val imagesList: List<String> = try {
                objectMapper.readValue(imagesJson)
            } catch (e: Exception) {
                emptyList()
            }
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
                commentCount = commentCount,
                images = imagesList
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

    fun unvoteRoutePlan(id: Long, userId: Long): RoutePlan {
        val routePlan = routePlanRepository.findById(id).orElseThrow {
            IllegalArgumentException("Route plan not found")
        }
        val existingUpvote = routePlanUpvoteRepository.findByRoutePlanIdAndUserId(id, userId)
            ?: throw IllegalArgumentException("User hasn't upvoted this route")

        routePlanUpvoteRepository.delete(existingUpvote)
        routePlan.upvotes -= 1
        return routePlanRepository.save(routePlan)
    }

//    fun userUpvotesRoute(userId: Long, routeId: Long): RoutePlan? {
//        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
//        val route = routePlanRepository.findById(routeId).orElseThrow { IllegalArgumentException("RoutePlan not found") }
//
//        if (!user.upvotedRoutes.contains(route)) {
//            user.upvotedRoutes.add(route)
//            userRepository.save(user)
//        }
//        return route
//    }
//
//    fun userRemovesUpvote(userId: Long, routeId: Long): RoutePlan? {
//        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
//        val route = routePlanRepository.findById(routeId).orElseThrow { IllegalArgumentException("RoutePlan not found") }
//
//        user.upvotedRoutes.remove(route)
//        userRepository.save(user)
//        return route
//    }

}
