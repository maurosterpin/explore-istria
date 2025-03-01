package com.example.pula_go.model

import jakarta.persistence.*

@Entity
@Table(name = "attractions")
data class Attraction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val name: String,

    val lat: Double,

    val lng: Double,

    @Lob
    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @Lob
    @Column(columnDefinition = "TEXT")
    val imageUrl: String? = null
)
