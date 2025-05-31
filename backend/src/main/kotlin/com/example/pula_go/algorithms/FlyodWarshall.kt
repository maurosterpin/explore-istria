package com.example.pula_go.algorithms

fun floydWarshall(graph: Array<IntArray>): Array<IntArray> {
    val max = Int.MAX_VALUE
    val n = graph.size
    val dist = Array(n) { i -> IntArray(n) { j -> graph[i][j] } }

    for (k in 0 until n) {
        for (i in 0 until n) {
            for (j in 0 until n) {
                if (dist[i][k] != max && dist[k][j] != max) {
                    dist[i][j] = minOf(dist[i][j], dist[i][k] + dist[k][j])
                }
            }
        }
    }

    return dist
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
