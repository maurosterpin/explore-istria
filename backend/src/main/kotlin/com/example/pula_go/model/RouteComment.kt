package com.example.pula_go.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "route_plan_comment")
data class RouteComment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id")
    val userId: Long,

    @Column(name = "username")
    val username: String,

    @Column(columnDefinition = "TEXT")
    val comment: String,

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_plan_id")
    val routePlan: RoutePlan,

    val createdAt: LocalDateTime = LocalDateTime.now()
)
