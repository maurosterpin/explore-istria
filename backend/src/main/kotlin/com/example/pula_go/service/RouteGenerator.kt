package com.example.pula_go.service

import com.example.pula_go.model.Attraction
import com.example.pula_go.model.RoutePreferences
import org.springframework.stereotype.Service
import kotlin.math.*

@Service
class RouteGenerator {

    fun distance(a: Attraction, b: Attraction): Double {
        val earthRadius = 6371e3
        val phi1 = a.lat * PI / 180
        val phi2 = b.lat * PI / 180
        val deltaPhi = (b.lat - a.lat) * PI / 180
        val deltaLambda = (b.lng - a.lng) * PI / 180

        val sinDeltaPhi = sin(deltaPhi / 2).pow(2)
        val sinDeltaLambda = sin(deltaLambda / 2).pow(2)
        val aCalc = sinDeltaPhi + cos(phi1) * cos(phi2) * sinDeltaLambda
        val c = 2 * atan2(sqrt(aCalc), sqrt(1 - aCalc))
        return earthRadius * c
    }

    fun generateRoute(attractions: List<Attraction>): List<Attraction> {
        if (attractions.isEmpty()) return emptyList()
        val remaining = attractions.toMutableList()
        val route = mutableListOf<Attraction>()
        val startingPoint = (0 until remaining.size).random()
        val current = remaining.removeAt(startingPoint)
        route.add(current)
        while (remaining.size > 0) {
            val next = remaining.minByOrNull { distance(current, it) } ?: break
            route.add(next)
            remaining.remove(next)
        }
        return route
    }

    fun generateRandomRoute(attractions: List<Attraction>): List<Attraction> {
        if (attractions.isEmpty()) return emptyList()
        val remaining = attractions.toMutableList()
        val route = mutableListOf<Attraction>()
        val startingPoint = (0 until remaining.size).random()
        val current = remaining.removeAt(startingPoint)
        route.add(current)
        while (route.size < 5) {
            val nextPoint = (0 until remaining.size).random()
            val next = remaining.removeAt(nextPoint)
            route.add(next)
            remaining.remove(next)
        }
        return route
    }

    private fun distanceLatLng(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val earthRadius = 6371e3
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val dPhi = Math.toRadians(lat2 - lat1)
        val dLambda = Math.toRadians(lng2 - lng1)

        val a = sin(dPhi / 2).pow(2) +
                cos(phi1) * cos(phi2) * sin(dLambda / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earthRadius * c
    }

    fun generateRouteWithPreferences(
        allAttractions: List<Attraction>,
        prefs: RoutePreferences
    ): List<Attraction> {
        val averageSpeeds = mapOf(
            "driving-car" to 30.0,
            "foot-walking" to 5.0,
            "cycling-regular" to 15.0,
            "wheelchair" to 3.0
        )

        val speedKmh = averageSpeeds[prefs.transportMode] ?: 30.0
        val speedMps = speedKmh * 1000 / 3600

        val totalDurationMin = prefs.duration?.times(60) ?: 180.0
        val visitTimePerAttractionMin = 30.0

        var remainingBudget = prefs.budget
        var remainingTime = totalDurationMin

        var candidates = if (prefs.categories.isNotEmpty()) {
            allAttractions.filter { it.category != null && it.category in prefs.categories }
        } else allAttractions

        if (!prefs.nearMe && prefs.cities.isNotEmpty()) {
            candidates = candidates.filter { it.city != null && it.city in prefs.cities }
        }

        if (prefs.nearMe && prefs.userLat != null && prefs.userLng != null) {
            val radiusMeters = 20_000.0
            candidates = candidates.filter {
                distanceLatLng(prefs.userLat, prefs.userLng, it.lat, it.lng) <= radiusMeters
            }
        }

        if (prefs.pickHighestRated == true) {
            candidates = candidates.sortedByDescending { it.rating ?: 0.0 }
        } else {
            candidates = candidates.shuffled()
        }

        val route = mutableListOf<Attraction>()
        val remaining = candidates.toMutableList()
        var currentLat = prefs.userLat ?: remaining.firstOrNull()?.lat
        var currentLng = prefs.userLng ?: remaining.firstOrNull()?.lng

        while (remaining.isNotEmpty() && remainingTime >= visitTimePerAttractionMin) {
            val next = remaining.minByOrNull {
                distanceLatLng(currentLat ?: it.lat, currentLng
                    ?: it.lng, it.lat, it.lng)
            } ?: break
            val travelDistance = distanceLatLng(currentLat ?: next.lat, currentLng
                ?: next.lng, next.lat, next.lng)
            val travelTimeMin = travelDistance / speedMps / 60
            val attractionPrice = next.price?.toDouble()

            val canAfford = remainingBudget == null || attractionPrice == null
                    || remainingBudget >= attractionPrice
            val mustBeFree = remainingBudget != null && remainingBudget <= 0.0

            val isAcceptable =
                if (mustBeFree) attractionPrice == null || attractionPrice == 0.0
                else canAfford

            val totalTimeNeeded = travelTimeMin + visitTimePerAttractionMin

            if (isAcceptable && remainingTime >= totalTimeNeeded) {
                route.add(next)
                remainingTime -= totalTimeNeeded
                if (attractionPrice != null && remainingBudget != null) {
                    remainingBudget -= attractionPrice
                }
                currentLat = next.lat
                currentLng = next.lng
            }

            remaining.remove(next)
        }
        return route
    }
}
