package com.example.pula_go.algorithms

import java.util.*

data class Edge(val to: Int, val weight: Int)

fun dijkstra(graph: List<List<Edge>>, start: Int): IntArray {
    val size = graph.size
    val distance = IntArray(size) { Int.MAX_VALUE }
    distance[start] = 0

    val queue = PriorityQueue(compareBy<Pair<Int, Int>> { it.second })
    queue.add(Pair(start, 0))

    while (queue.isNotEmpty()) {
        val (current, distCurrent) = queue.poll()

        if (distCurrent > distance[current]) continue

        for (edge in graph[current]) {
            val newDistance = distance[current] + edge.weight
            if (newDistance < distance[edge.to]) {
                distance[edge.to] = newDistance
                queue.add(Pair(edge.to, newDistance))
            }
        }
    }

    return distance
}

fun main() {
    val graph = listOf(
        listOf(Edge(1, 2), Edge(2, 4)),
        listOf(Edge(2, 1), Edge(3, 7)),
        listOf(Edge(3, 3)),
        emptyList()
    )

    val distances = dijkstra(graph, 0)

    println("Najkraće udaljenosti od vrha 0:")
    distances.forEachIndexed { index, d ->
        println("Do vrha $index: ${if (d == Int.MAX_VALUE) "∞" else d}")
    }
}
