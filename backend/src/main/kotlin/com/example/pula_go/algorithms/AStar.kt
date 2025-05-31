package com.example.pula_go.algorithms

import java.util.*

fun heuristic(current: Int, goal: Int): Int {
    return 0
}

fun aStar(graph: List<List<Edge>>, start: Int, goal: Int): Pair<IntArray, IntArray?> {
    val n = graph.size
    val distance = IntArray(n) { Int.MAX_VALUE }
    val estimatedTotal = IntArray(n) { Int.MAX_VALUE }
    val cameFrom = IntArray(n) { -1 }

    distance[start] = 0
    estimatedTotal[start] = heuristic(start, goal)

    val queue = PriorityQueue(compareBy<Pair<Int, Int>> { it.second })
    queue.add(Pair(start, estimatedTotal[start]))

    while (queue.isNotEmpty()) {
        val (current, _) = queue.poll()

        if (current == goal) break

        for (edge in graph[current]) {
            val newDistance = distance[current] + edge.weight
            if (newDistance < distance[edge.to]) {
                cameFrom[edge.to] = current
                distance[edge.to] = newDistance
                estimatedTotal[edge.to] = newDistance + heuristic(edge.to, goal)
                queue.add(Pair(edge.to, estimatedTotal[edge.to]))
            }
        }
    }

    return Pair(distance, cameFrom)
}

fun reconstructPath(cameFrom: IntArray, start: Int, goal: Int): List<Int> {
    val path = mutableListOf<Int>()
    var current = goal
    while (current != -1 && current != start) {
        path.add(current)
        current = cameFrom[current]
    }
    if (current == start) {
        path.add(start)
        path.reverse()
        return path
    }
    return emptyList()
}

fun main() {
    val graph = listOf(
        listOf(Edge(1, 1), Edge(2, 4)),
        listOf(Edge(2, 2), Edge(3, 5)),
        listOf(Edge(3, 1)),
        emptyList()
    )

    val (distances, cameFrom) = aStar(graph, 0, 3)

    println("Najkraće udaljenosti od vrha 0:")
    distances.forEachIndexed { index, d ->
        println("Do vrha $index: ${if (d == Int.MAX_VALUE) "∞" else d}")
    }

    if (cameFrom != null) {
        val path = reconstructPath(cameFrom, 0, 3)
        println("\nNajkraći put od 0 do 3: ${if (path.isEmpty()) "nije pronađen" else path.joinToString(" → ")}")
    }
}