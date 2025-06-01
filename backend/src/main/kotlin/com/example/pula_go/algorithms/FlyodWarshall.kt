package com.example.pula_go.algorithms

fun floydWarshall(graph: Array<IntArray>): Array<IntArray> {
    val INF = Int.MAX_VALUE
    val vertexCount = graph.size
    val distance = Array(vertexCount) { from ->
        IntArray(vertexCount) { to -> graph[from][to] }
    }

    for (midVertex in 0 until vertexCount) {
        for (from in 0 until vertexCount) {
            for (to in 0 until vertexCount) {
                if (distance[from][midVertex] != INF && distance[midVertex][to] != INF) {
                    distance[from][to] = minOf(
                        distance[from][to],
                        distance[from][midVertex] + distance[midVertex][to]
                    )
                }
            }
        }
    }

    return distance
}


fun main() {
    val max = Int.MAX_VALUE
    val graph = arrayOf(
        intArrayOf(0,   3,   max, 5),
        intArrayOf(2,   0,   max, 4),
        intArrayOf(max, 1,   0,   max),
        intArrayOf(max, max, 2,   0)
    )

    println("Početna matrica:")
    for (row in graph) {
        for (value in row) {
            print(if (value == max) "∞ " else "$value ")
        }
        println()
    }

    val result = floydWarshall(graph)

    println("Matrica najkraćih udaljenosti:")
    for (row in result) {
        for (value in row) {
            print(if (value == max) "∞ " else "$value ")
        }
        println()
    }
}
