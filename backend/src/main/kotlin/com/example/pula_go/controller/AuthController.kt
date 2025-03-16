package com.example.pula_go.controller

import com.example.pula_go.model.User
import com.example.pula_go.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

data class RegistrationRequest(
    val username: String,
    val password: String
)

@RestController
@RequestMapping("/register")
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @PostMapping
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
}

