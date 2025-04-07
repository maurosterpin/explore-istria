package com.example.pula_go.model

import jakarta.persistence.*

@Entity
@Table(name = "route_plan")
data class RoutePlan(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val name: String,

    @Column(columnDefinition = "TEXT")
    val description: String,

    val category: String? = null,

    val city: String? = null,

    @Column(name = "attraction_ids", columnDefinition = "TEXT")
    val attractionIds: String,

    var upvotes: Int = 0,

    @Column(name = "userId")
    val userId: Long,

    @Column(columnDefinition = "TEXT")
    val images: String? = null

)
