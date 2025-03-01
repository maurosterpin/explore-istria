package com.example.pula_go.service

import com.example.pula_go.model.Attraction
import com.example.pula_go.repository.AttractionRepository
import org.springframework.stereotype.Service

@Service
class AttractionService(
    private val attractionRepository: AttractionRepository,
    private val googlePlacesService: GooglePlacesService
) {
    fun fetchAndSaveAttractions(): List<Attraction> {
        attractionRepository.truncateTable()
        val attractions = googlePlacesService.fetchAllAttractions()
        return attractionRepository.saveAll(attractions)
    }

    fun getAllAttractions(): List<Attraction> = attractionRepository.findAll()
}
