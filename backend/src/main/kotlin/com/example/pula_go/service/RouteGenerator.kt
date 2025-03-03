package com.example.pula_go.service

import com.example.pula_go.model.Attraction
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
}
