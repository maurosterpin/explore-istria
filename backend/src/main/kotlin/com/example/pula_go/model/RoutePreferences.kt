package com.example.pula_go.model

data class RoutePreferences(
    val categories: List<Category> = emptyList(),
    val cities: List<String> = emptyList(),
    val nearMe: Boolean = false,
    val userLat: Double? = null,
    val userLng: Double? = null,
    val duration: Double? = null,
    val budget: Double? = null,
    val transportMode: String? = "driving-car",
    val pickHighestRated: Boolean? = false
)