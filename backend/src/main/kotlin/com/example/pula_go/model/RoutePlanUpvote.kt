package com.example.pula_go.model

import java.time.LocalDateTime
import jakarta.persistence.*

@Entity
@Table(
    name = "route_plan_upvote",
    uniqueConstraints = [UniqueConstraint(columnNames = ["route_plan_id", "username"])]
)
data class RoutePlanUpvote(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_plan_id")
    val routePlan: RoutePlan,

    @Column(name = "user_id")
    val userId: Long,

    val createdAt: LocalDateTime = LocalDateTime.now()
)
