package com.example.pula_go.model

data class RoutePreferences(
    val categories: List<Category> = emptyList(),
    val cities: List<String> = emptyList(),
    val nearMe: Boolean = false,
    val userLat: Double? = null,
    val userLng: Double? = null
)