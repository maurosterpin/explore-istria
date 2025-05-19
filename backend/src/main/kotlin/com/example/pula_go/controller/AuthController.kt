package com.example.pula_go.controller

import com.example.pula_go.model.RoutePlanRating
import com.example.pula_go.model.User
import com.example.pula_go.repository.RoutePlanUpvoteRepository
import com.example.pula_go.repository.UserRepository
import com.example.pula_go.utils.JwtTokenProvider
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*

data class RegistrationRequest(
    val username: String,
    val password: String
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val username: String,
    val userId: Long,
    val upvotedRoutes: List<Long>
)

@RestController
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider,
    private val routePlanUpvoteRepository: RoutePlanUpvoteRepository
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegistrationRequest): String {
        if (userRepository.findByUsername(request.username) != null) {
            return "Username already exists"
        }
        val newUser = User(
            username = request.username,
            password = passwordEncoder.encode(request.password)
        )
        userRepository.save(newUser)
        return "User registered successfully"
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody loginRequest: LoginRequest): ResponseEntity<LoginResponse> {
        val authToken = UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
        val authentication = authenticationManager.authenticate(authToken)
        SecurityContextHolder.getContext().authentication = authentication

        val token = jwtTokenProvider.generateToken(loginRequest.username)
        val user = userRepository.findByUsername(loginRequest.username)
        val userUpvotes: List<RoutePlanRating> = routePlanUpvoteRepository.findByUserId(user!!.id)
        val upvotedRouteIds: List<Long> = userUpvotes.map { it.routePlan.id }
        val response = LoginResponse(token, loginRequest.username, user.id, upvotedRouteIds)
        return ResponseEntity.ok(response)
    }
}
