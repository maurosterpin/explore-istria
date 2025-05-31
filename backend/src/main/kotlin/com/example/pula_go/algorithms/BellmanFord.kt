package com.example.pula_go.algorithms


fun bellmanFord(graph: List<List<Edge>>, source: Int): Pair<IntArray, Boolean> {
    val vertices = graph.size
    val distance = IntArray(vertices) { Int.MAX_VALUE }
    distance[source] = 0

    val edges = mutableListOf<Triple<Int, Int, Int>>()
    for (u in graph.indices) {
        for (edge in graph[u]) {
            edges.add(Triple(u, edge.to, edge.weight))
        }
    }

    repeat(vertices - 1) {
        for ((u, v, w) in edges) {
            if (distance[u] != Int.MAX_VALUE && distance[u] + w < distance[v]) {
                distance[v] = distance[u] + w
            }
        }
    }

    for ((u, v, w) in edges) {
        if (distance[u] != Int.MAX_VALUE && distance[u] + w < distance[v]) {
            return Pair(distance, true)
        }
    }

    return Pair(distance, false)
}

fun main() {
    val graph = listOf(
        listOf(Edge(1, 4), Edge(2, 5)),
        listOf(Edge(2, -3), Edge(3, 7)),
        listOf(Edge(3, 4)),
        emptyList()
    )

    val (distances, hasNegativeCycle) = bellmanFord(graph, 0)

    if (hasNegativeCycle) {
        println("Graf sadrži negativan ciklus.")
    } else {
        println("Najkraće udaljenosti od vrha 0:")
        distances.forEachIndexed { index, d ->
            println("Do vrha $index: ${if (d == Int.MAX_VALUE) "∞" else d}")
        }
    }
}


