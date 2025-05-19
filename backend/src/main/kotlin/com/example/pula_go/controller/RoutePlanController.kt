package com.example.pula_go.controller

import com.example.pula_go.model.RoutePlan
import com.example.pula_go.service.RoutePlanResponse
import com.example.pula_go.service.RoutePlanService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/routes")
class RoutePlanController(
    private val routePlanService: RoutePlanService
) {

    @PostMapping
    fun createRoutePlan(@RequestBody routePlan: RoutePlan): RoutePlan {
        return routePlanService.createRoutePlan(routePlan)
    }

    @GetMapping
    fun getRoutePlans(
        @RequestParam(required = false) sortBy: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) city: String?
    ): List<RoutePlanResponse> {
        return routePlanService.getRoutePlans(sortBy, category, city)
    }
}
