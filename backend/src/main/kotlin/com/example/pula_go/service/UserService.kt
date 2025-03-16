package com.example.pula_go.service

import com.example.pula_go.repository.UserRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val appUser = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found with username: $username")
        return User.builder()
            .username(appUser.username)
            .password(appUser.password)
            .roles("USER")
            .build()
    }
}

