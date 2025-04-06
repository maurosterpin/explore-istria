package com.example.pula_go.controller

import com.example.pula_go.model.RouteComment
import com.example.pula_go.model.RoutePlan
import com.example.pula_go.service.RouteCommentService
import com.example.pula_go.service.RoutePlanService
import org.springframework.web.bind.annotation.*

@RestController
class RouteCommentController(
    private val routeCommentService: RouteCommentService,
    private val routePlanService: RoutePlanService
) {

    data class CommentRequest(
        val userId: Long,
        val username: String,
        val comment: String
    )

    @PostMapping("/routes/comment/{routePlanId}")
    fun addComment(
        @PathVariable routePlanId: Long,
        @RequestBody request: CommentRequest
    ): RouteComment? {
        return routeCommentService.addComment(routePlanId, request.userId, request.username, request.comment)
    }

    @GetMapping("/public/routes/comment/{routePlanId}")
    fun getComments(@PathVariable routePlanId: Long): List<RouteComment> {
        return routeCommentService.getComments(routePlanId)
    }

    @PostMapping("/routes/upvote/{routePlanId}")
    fun upvoteRoutePlan(@PathVariable routePlanId: Long, @RequestParam userId: Long): RoutePlan? {
        return routePlanService.upvoteRoutePlan(routePlanId, userId)
    }
}
