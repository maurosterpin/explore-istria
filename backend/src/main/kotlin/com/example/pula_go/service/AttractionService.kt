package com.example.pula_go.service

import com.example.pula_go.model.Attraction
import com.example.pula_go.model.Category
import com.example.pula_go.repository.AttractionRepository
import org.springframework.stereotype.Service

@Service
class AttractionService(
    private val attractionRepository: AttractionRepository,
    private val googlePlacesService: GooglePlacesService
) {

    fun fetchAndSaveAttractions(): List<Attraction> {
        val attractions = googlePlacesService.fetchAllAttractions()
        return attractionRepository.saveAll(attractions)
    }

    fun updateExistingAttractions(newAttractions: List<Attraction>): List<Attraction> {
        val updatedAttractions = mutableListOf<Attraction>()
        newAttractions.forEach { attraction ->
            if (attractionRepository.existsById(attraction.id)) {
                val updated = attractionRepository.save(attraction)
                updatedAttractions.add(updated)
            }
        }
        return updatedAttractions
    }

    fun getAllAttractions(category: Category?, city: String?): List<Attraction?>? = attractionRepository.findAllByCustomParams(category, city)

    fun getAllAttractions(): List<Attraction> = attractionRepository.findAll()

    fun deleteAttraction(id: Long) {
        attractionRepository.deleteById(id)
    }

    fun useRoute(ids: String): List<Attraction> {
        val idsList = ids
            .split(",")
            .mapNotNull { it.trim().toLongOrNull() }
        val attractions = attractionRepository.findByIdIn(idsList)
        return attractions
    }
}
