package com.example.pula_go.service

import com.example.pula_go.model.RoutePlan
import com.example.pula_go.model.RoutePlanRating
import com.example.pula_go.model.RoutePlanUpdateRequest
import com.example.pula_go.repository.*
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
    private val attractionRepository: AttractionRepository,
    private val routePlanRepository: RoutePlanRepository,
    private val routePlanUpvoteRepository: RoutePlanUpvoteRepository,
    private val routeCommentRepository: RouteCommentRepository,
    private val userRepository: UserRepository
) {

    fun createRoutePlan(request: RoutePlanUpdateRequest): RoutePlan {
        val attractions = attractionRepository.findByIdIn(request.attractionIds)
        val categories = attractions.map { it.category }.distinct().joinToString(separator = ",")
        val cities = attractions.map { it.city }.distinct().joinToString(separator = ",")
        val newRoutePlan = RoutePlan(
            id = 0,
            name = request.name,
            description = request.description,
            city = cities,
            category = categories,
            attractionIds = request.attractionIds.joinToString(separator = ","),
            upvotes = 1,
            userId = 1,
            images = "[" + attractions.joinToString(separator = ",") { '"' + it.imageUrl.toString() + '"' } + "]"
        )
        return routePlanRepository.save(newRoutePlan)
    }

    fun updateRoutePlan(request: RoutePlanUpdateRequest): RoutePlan {
        val currentRoutePlan = routePlanRepository.getById(request.id)
        val attractions = attractionRepository.findByIdIn(request.attractionIds)
        val categories = attractions.map { it.category }.distinct().joinToString(separator = ",")
        val cities = attractions.map { it.city }.distinct().joinToString(separator = ",")
        currentRoutePlan.id = request.id.toInt().toLong()
        currentRoutePlan.name = request.name
        currentRoutePlan.description = request.description
        currentRoutePlan.category = categories
        currentRoutePlan.city = cities
        currentRoutePlan.attractionIds = request.attractionIds.joinToString(separator = ",")
        currentRoutePlan.upvotes = currentRoutePlan.upvotes
        currentRoutePlan.userId = 1
        currentRoutePlan.images = "[" + attractions.joinToString(separator = ",") { '"' + it.imageUrl.toString() + '"' } + "]"

        return routePlanRepository.save(currentRoutePlan)
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
            "highest rated" -> routes.sortedByDescending { it.upvotes } // TODO
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
        val vote = RoutePlanRating(
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
