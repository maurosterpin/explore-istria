package com.example.pula_go.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*

@JsonIgnoreProperties(value = ["hibernateLazyInitializer", "handler"])
@Entity
@Table(name = "route_plan")
data class RoutePlan(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    var name: String,

    @Column(columnDefinition = "TEXT")
    var description: String,

    var category: String? = null,

    var city: String? = null,

    @Column(name = "attraction_ids", columnDefinition = "TEXT")
    var attractionIds: String,

    var upvotes: Int = 0,

    @Column(name = "userId")
    var userId: Long,

    @Column(columnDefinition = "TEXT")
    var images: String? = null

)
