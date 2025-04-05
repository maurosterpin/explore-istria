package com.example.pula_go.repository


import com.example.pula_go.model.RoutePlan
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RoutePlanRepository : JpaRepository<RoutePlan, Long> {

}
