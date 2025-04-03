package com.example.pula_go.controller

import com.example.pula_go.model.User
import com.example.pula_go.repository.UserRepository
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

@RestController
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager
) {

    @PostMapping("/public/register")
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

    @PostMapping("/public/login")
    fun login(@Valid @RequestBody loginRequest: LoginRequest): ResponseEntity<User> {
        val authToken = UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
        val authentication = authenticationManager.authenticate(authToken)
        SecurityContextHolder.getContext().authentication = authentication
        val user = userRepository.findByUsername(loginRequest.username)
        return ResponseEntity.ok(user)
    }
}

