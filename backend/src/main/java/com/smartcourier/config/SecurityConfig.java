package com.smartcourier.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.smartcourier.repository.UserRepository;
import com.smartcourier.service.JwtService;

@Configuration
public class SecurityConfig {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public SecurityConfig(JwtService jwtService, UserRepository userRepository) {

		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Value("${app.cors.allowed-origins:http://localhost:5173}")
	private String allowedOrigins;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(java.util.Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
		config.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		config.setAllowedHeaders(java.util.List.of("*"));
		config.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtService, userRepository);

		http.csrf(csrf -> csrf.disable())

				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				.authorizeHttpRequests(auth -> auth

						// Health
						.requestMatchers("/api/health").permitAll()

						// Authentication
						.requestMatchers("/api/auth/login").permitAll()

						// User registration
						.requestMatchers(HttpMethod.POST, "/api/users").permitAll()

						// Delivery agent registration
						.requestMatchers(HttpMethod.POST, "/api/agents").permitAll()

						// Razorpay order creation
						.requestMatchers(HttpMethod.POST, "/api/razorpay/create-order").hasAnyRole("CUSTOMER", "ADMIN")

						// Parcel APIs
						.requestMatchers("/api/parcels/**").hasAnyRole("CUSTOMER", "DELIVERY_AGENT", "MANAGER", "ADMIN")

						// Assignment APIs
						.requestMatchers("/api/assignments/**").hasAnyRole("DELIVERY_AGENT", "MANAGER", "ADMIN")

						// Payment APIs
						.requestMatchers("/api/payments/**").hasAnyRole("CUSTOMER", "ADMIN")

						// Feedback
						.requestMatchers("/api/feedback/**").hasAnyRole("CUSTOMER", "ADMIN")

						// Complaints
						.requestMatchers("/api/complaints/**").hasAnyRole("CUSTOMER", "ADMIN", "MANAGER")

						// Delivery agents
						.requestMatchers("/api/agents/**").hasAnyRole("DELIVERY_AGENT", "MANAGER", "ADMIN")

						// Hubs
						.requestMatchers("/api/hubs/**").hasAnyRole("MANAGER", "ADMIN")

						// Analytics
						.requestMatchers("/api/analytics/**").hasAnyRole("MANAGER", "ADMIN")

						// Invoices
						.requestMatchers("/api/invoices/**").hasAnyRole("CUSTOMER", "MANAGER", "ADMIN")

						// Notifications
						.requestMatchers("/api/notifications/**")
						.hasAnyRole("CUSTOMER", "DELIVERY_AGENT", "MANAGER", "ADMIN")

						// AI prediction
						.requestMatchers("/api/prediction/**")
						.hasAnyRole("CUSTOMER", "DELIVERY_AGENT", "MANAGER", "ADMIN")

						// User management
						.requestMatchers("/api/users/**").hasAnyRole("ADMIN", "MANAGER")

						// Everything else requires authentication
						.anyRequest().authenticated())

				.httpBasic(httpBasic -> httpBasic.disable())

				.formLogin(formLogin -> formLogin.disable())

				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}