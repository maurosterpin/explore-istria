package com.example.pula_go.algorithms


fun bellmanFord(graph: List<List<Edge>>, start: Int): Pair<IntArray, Boolean> {
    val vertices = graph.size
    val distance = IntArray(vertices) { Int.MAX_VALUE }
    distance[start] = 0

    val edges = mutableListOf<Triple<Int, Int, Int>>()
    for (startVertex in graph.indices) {
        for (edge in graph[startVertex]) {
            edges.add(Triple(startVertex, edge.to, edge.weight))
        }
    }

    repeat(vertices - 1) {
        for ((startVertex, targetVertex, edgeWeight) in edges) {
            if (distance[startVertex] != Int.MAX_VALUE &&
                distance[startVertex] + edgeWeight < distance[targetVertex]
            ) {
                distance[targetVertex] = distance[startVertex] + edgeWeight
            }
        }
    }

    for ((startVertex, targetVertex, edgeWeight) in edges) {
        if (distance[startVertex] != Int.MAX_VALUE &&
            distance[startVertex] + edgeWeight < distance[targetVertex]
        ) {
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


