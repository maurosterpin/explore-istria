package com.example.pula_go.controller

import com.example.pula_go.model.Attraction
import com.example.pula_go.model.Category
import com.example.pula_go.model.RateAttractionRequest
import com.example.pula_go.model.RoutePreferences
import com.example.pula_go.service.AttractionService
import com.example.pula_go.service.RouteGenerator
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

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

    @GetMapping("/get")
    fun getAttractions(
        @RequestParam(required = false) category: Category?,
        @RequestParam(required = false) city: String?,
    ): List<Attraction?>? {
        return attractionService.getAllAttractions(category, city)
    }

    @GetMapping("/getByIds")
    fun getAttractionsByIds(
        @RequestParam(required = true) ids: List<Long>,
    ): List<Attraction?>? {
        return attractionService.getAllAttractionsByIds(ids)
    }

    @PostMapping("/add")
    fun addAttraction(@RequestBody attraction: Attraction): ResponseEntity<Attraction> {
        val savedAttraction = attractionService.addAttraction(attraction)
        return ResponseEntity.ok(savedAttraction)
    }

    @PostMapping("/adds")
    fun addAttractions(@RequestBody attractions: List<Attraction>): ResponseEntity<List<Attraction>> {
        val savedAttractions = attractionService.addAttractions(attractions)
        return ResponseEntity.ok(savedAttractions)
    }

    @PostMapping("/route")
    fun getRoute(@RequestBody attractions: List<Attraction>): List<Attraction> {
        return routeGenerator.generateRoute(attractions)
    }

    @PutMapping("/admin/update")
    fun updateAttractions(@RequestBody attractions: List<Attraction>): List<Attraction> {
        return attractionService.updateExistingAttractions(attractions)
    }

    @PostMapping("/attraction/rate")
    fun rateAttraction(@RequestBody rateAttractionRequest: RateAttractionRequest): ResponseEntity<String> {
        return ResponseEntity.ok(attractionService.rateAttraction(rateAttractionRequest))
    }

    @PostMapping("/generate")
    fun generateWithPrefs(@RequestBody prefs: RoutePreferences): List<Attraction> {
        val allAttractions = attractionService.getAllAttractions()
        return routeGenerator.generateRouteWithPreferences(allAttractions, prefs)
    }

    @PostMapping("/use")
    fun useRoute(@RequestBody attractionIds: String): List<Attraction> {
        val attractions = attractionService.useRoute(attractionIds)
        return attractions
    }

    @DeleteMapping("/admin/delete/{attractionId}")
    fun deleteAttraction(@PathVariable attractionId: Long) {
        return attractionService.deleteAttraction(attractionId)
    }
}
