package com.example.pula_go.controller

import com.example.pula_go.model.Attraction
import com.example.pula_go.service.AttractionService
import com.example.pula_go.service.RouteGenerator
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@CrossOrigin(origins = ["http://localhost:8081"])
class AttractionController(
    private val attractionService: AttractionService,
    private val routeGenerator: RouteGenerator
) {

    @GetMapping("/fetch")
    fun fetchAttractions(): List<Attraction> {
        return attractionService.fetchAndSaveAttractions()
    }

    @GetMapping("/route")
    fun getRoute(): List<Attraction> {
        val attractions = attractionService.getAllAttractions()
        return routeGenerator.generateRoute(attractions)
    }
}
