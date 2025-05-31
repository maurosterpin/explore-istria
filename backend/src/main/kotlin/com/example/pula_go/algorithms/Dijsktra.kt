package com.example.pula_go.algorithms

import java.util.*

data class Edge(val to: Int, val weight: Int)

fun dijkstra(graph: List<List<Edge>>, source: Int): IntArray {
    val n = graph.size
    val distance = IntArray(n) { Int.MAX_VALUE }
    distance[source] = 0

    val queue = PriorityQueue(compareBy<Pair<Int, Int>> { it.second })
    queue.add(Pair(source, 0))

    while (queue.isNotEmpty()) {
        val (u, distU) = queue.poll()

        if (distU > distance[u]) continue

        for (edge in graph[u]) {
            val v = edge.to
            val weight = edge.weight
            if (distance[u] + weight < distance[v]) {
                distance[v] = distance[u] + weight
                queue.add(Pair(v, distance[v]))
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
