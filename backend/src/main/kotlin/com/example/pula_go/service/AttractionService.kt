package com.example.pula_go.service

import com.example.pula_go.model.Attraction
import com.example.pula_go.model.Category
import com.example.pula_go.model.RateAttractionRequest
import com.example.pula_go.repository.AttractionRepository
import org.springframework.stereotype.Service
import kotlin.jvm.Throws

@Service
class AttractionService(
    private val attractionRepository: AttractionRepository,
    private val googlePlacesService: GooglePlacesService
) {

//    fun fetchAndSaveAttractions(): List<Attraction> {
//        val attractions = googlePlacesService.fetchAllAttractions()
//        return attractionRepository.saveAll(attractions)
//    }

    fun fetchAndSaveAttractions(): List<Attraction> {
        val attractions = googlePlacesService.fetchAllAttractions()
        return attractions
    }

    fun addAttraction(attraction: Attraction): Attraction {
        return attractionRepository.save(attraction)
    }

    fun updateAttraction(attraction: Attraction): Attraction {
        val currentAttraction = attractionRepository.getById(attraction.id)
        currentAttraction.name = attraction.name
        currentAttraction.description = attraction.description
        currentAttraction.city = attraction.city
        currentAttraction.category = attraction.category
        currentAttraction.imageUrl = attraction.imageUrl
        currentAttraction.lat = attraction.lat
        currentAttraction.lng = attraction.lng
        currentAttraction.price = attraction.price
        return attractionRepository.save(currentAttraction)
    }

    fun addAttractions(attractions: List<Attraction>): List<Attraction> {
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

    fun getAllAttractions(category: Category?, city: String?): List<Attraction?>? =
        attractionRepository.findAllByCustomParams(category, city)

    fun getAllAttractions(): List<Attraction> = attractionRepository.findAll()

    fun getAllAttractionsByIds(ids: List<Long>): List<Attraction> = attractionRepository.findAllById(ids)

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

    fun rateAttraction(request: RateAttractionRequest): String {
        val optionalAttraction = attractionRepository.findById(request.attractionId)
        if (optionalAttraction.isPresent) {
            val attraction = optionalAttraction.get()

            val currentRating = attraction.rating
            val currentCount = attraction.ratingCount

            val newCount = currentCount + 1
            val newRating = ((currentRating * currentCount) + request.rating) / newCount

            attraction.rating = newRating
            attraction.ratingCount = newCount

            attractionRepository.save(attraction)

            return "Success"
        }

        return "Attraction not found"
    }

}
