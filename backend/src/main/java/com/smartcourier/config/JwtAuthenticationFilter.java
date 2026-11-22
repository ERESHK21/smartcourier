package com.smartcourier.config;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.smartcourier.entity.User;
import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {

		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String authHeader = request.getHeader("Authorization");

		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authHeader.substring(7);

		try {

			String email = jwtService.extractEmail(token);

			System.out.println("=================================");
			System.out.println("JWT Email: " + email);

			if (email == null || email.trim().isEmpty()) {
				System.out.println("JWT email is empty.");
				filterChain.doFilter(request, response);
				return;
			}

			User user = userRepository.findByEmail(email);

			if (user == null) {
				System.out.println("User not found for email: " + email);
				filterChain.doFilter(request, response);
				return;
			}

			String role = user.getRole();

			if (role == null || role.trim().isEmpty()) {
				System.out.println("User role is empty.");
				filterChain.doFilter(request, response);
				return;
			}

			/*
			 * Normalize the role.
			 *
			 * Database may contain:
			 *
			 * MANAGER manager ROLE_MANAGER
			 *
			 * Spring Security needs:
			 *
			 * ROLE_MANAGER
			 */
			role = role.trim().toUpperCase();

			if (role.startsWith("ROLE_")) {
				role = role.substring(5);
			}

			String authority = "ROLE_" + role;

			System.out.println("User Role from Database: " + user.getRole());
			System.out.println("Normalized Role: " + role);
			System.out.println("Spring Authority: " + authority);
			System.out.println("Request: " + request.getMethod() + " " + request.getRequestURI());
			System.out.println("=================================");

			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email, null,
					Collections.singletonList(new SimpleGrantedAuthority(authority)));

			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

			SecurityContextHolder.getContext().setAuthentication(authentication);

		} catch (Exception e) {

			System.out.println("Invalid JWT token: " + e.getMessage());
		}

		filterChain.doFilter(request, response);
	}
}