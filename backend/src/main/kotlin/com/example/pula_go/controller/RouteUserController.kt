package com.example.pula_go.controller

import com.example.pula_go.model.RouteComment
import com.example.pula_go.model.RoutePlan
import com.example.pula_go.model.RoutePlanRating
import com.example.pula_go.repository.RoutePlanUpvoteRepository
import com.example.pula_go.service.RouteCommentService
import com.example.pula_go.service.RoutePlanService
import org.springframework.web.bind.annotation.*

@RestController
class RouteCommentController(
    private val routeCommentService: RouteCommentService,
    private val routePlanService: RoutePlanService,
    private val routePlanUpvoteRepository: RoutePlanUpvoteRepository
) {

    data class CommentRequest(
        val rating: Double,
        val comment: String
    )

    data class UpvoteRequest(
        val userId: Long,
    )

    data class UpvoteResponse(
        val routePlan: RoutePlan?,
        val userUpvotes: List<Long>
    )

    @PostMapping("/routes/comment/{routePlanId}")
    fun addComment(
        @PathVariable routePlanId: Long,
        @RequestBody request: CommentRequest
    ): RouteComment? {
        return routeCommentService.addComment(routePlanId, request.comment, request.rating)
    }

    @GetMapping("/routes/comment/{routePlanId}")
    fun getComments(@PathVariable routePlanId: Long): List<RouteComment> {
        return routeCommentService.getComments(routePlanId)
    }

    @PostMapping("/routes/upvote/{routePlanId}")
    fun upvoteRoutePlan(@PathVariable routePlanId: Long, @RequestBody request: UpvoteRequest): UpvoteResponse? {
        val routePlan = routePlanService.upvoteRoutePlan(routePlanId, request.userId)
        val userUpvotes: List<RoutePlanRating> = routePlanUpvoteRepository.findByUserId(request.userId)
        val upvotedRouteIds: List<Long> = userUpvotes.map { it.routePlan.id }
        return UpvoteResponse(routePlan, upvotedRouteIds)
    }

    @PostMapping("/routes/unvote/{routePlanId}")
    fun unvoteRoutePlan(@PathVariable routePlanId: Long, @RequestBody request: UpvoteRequest): UpvoteResponse? {
        val routePlan = routePlanService.unvoteRoutePlan(routePlanId, request.userId)
        val userUpvotes: List<RoutePlanRating> = routePlanUpvoteRepository.findByUserId(request.userId)
        val upvotedRouteIds: List<Long> = userUpvotes.map { it.routePlan.id }
        return UpvoteResponse(routePlan, upvotedRouteIds)
    }
}
