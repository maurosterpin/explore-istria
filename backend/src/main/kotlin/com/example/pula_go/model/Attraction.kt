package com.example.pula_go.model

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "attractions")
data class Attraction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var name: String,

    var lat: Double,

    var lng: Double,

    @Lob
    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Lob
    @Column(columnDefinition = "TEXT")
    var imageUrl: String? = null,

    var rating: Double = 5.0,

    var ratingCount: Long = 1,

    @Enumerated(EnumType.STRING)
    var category: Category? = null,

    var price: BigDecimal? = null,

    var city: String? = null,
)
