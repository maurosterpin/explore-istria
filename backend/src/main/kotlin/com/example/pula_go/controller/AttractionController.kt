package com.example.pula_go.controller

import com.example.pula_go.model.Attraction
import com.example.pula_go.model.Category
import com.example.pula_go.service.AttractionService
import com.example.pula_go.service.RouteGenerator
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin(origins = ["http://localhost:8081"])
class AttractionController(
    private val attractionService: AttractionService,
    private val routeGenerator: RouteGenerator
) {

//    @GetMapping("/fetch")
//    fun fetchAttractions(): List<Attraction> {
//        return attractionService.fetchAndSaveAttractions()
//    }

    @GetMapping("/get")
    fun getAttractions(
        @RequestParam(required = false) category: Category?,
        @RequestParam(required = false) city: String?,
    ): List<Attraction?>? {
        return attractionService.getAllAttractions(category, city)
    }

    @PostMapping("/route")
    fun getRoute(@RequestBody attractions: List<Attraction>): List<Attraction> {
        return routeGenerator.generateRoute(attractions)
    }

    @PutMapping("/update")
    fun updateAttractions(@RequestBody attractions: List<Attraction>): List<Attraction> {
        return attractionService.updateExistingAttractions(attractions)
    }

    @DeleteMapping("/delete/{attractionId}")
    fun deleteAttraction(@PathVariable attractionId: Long) {
        return attractionService.deleteAttraction(attractionId)
    }
}
