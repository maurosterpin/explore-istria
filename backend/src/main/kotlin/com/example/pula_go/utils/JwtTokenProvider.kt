package com.example.pula_go.utils

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") secret: String,
    @Value("\${jwt.expiration}") val expiration: Long
) {

    private val key: Key = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateToken(username: String): String {
        val now = Date()
        val expiryDate = Date(now.time + expiration)

        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)
            return true
        } catch (ex: SecurityException) {
            // signature exception or malformed token
            println("Invalid JWT signature: ${ex.message}")
        } catch (ex: MalformedJwtException) {
            println("Invalid JWT token: ${ex.message}")
        } catch (ex: ExpiredJwtException) {
            println("Expired JWT token: ${ex.message}")
        } catch (ex: UnsupportedJwtException) {
            println("Unsupported JWT token: ${ex.message}")
        } catch (ex: IllegalArgumentException) {
            println("JWT claims string is empty: ${ex.message}")
        }
        return false
    }

    fun getUsernameFromToken(token: String): String {
        val claims = Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .body
        return claims.subject
    }
}
