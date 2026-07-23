package com.novelrealm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Les appels API (client mobile ou web) doivent recevoir un 401 franc en
        // cas de non-authentification, et non une redirection vers l'écran OAuth.
        RequestMatcher apiMatcher = request -> request.getRequestURI().startsWith("/api/");

        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())
                // Auth stateless via JWT. IF_REQUIRED (et non STATELESS) uniquement pour
                // laisser le flux OAuth2 Google (web) stocker sa requête d'autorisation en
                // session le temps de l'aller-retour ; le SecurityContext, lui, n'est JAMAIS
                // persisté en session (il est reconstruit à chaque requête par le filtre JWT).
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                // Le SecurityContext n'est JAMAIS lu/écrit en session : seul le JWT (cookie
                // ou header) fait foi. Sans ça, la session laissée par le flux OAuth2 Google
                // (principal = "sub" numérique) masquerait le JWT et casserait
                // authentication.getName() (attendu = email) sur les requêtes suivantes.
                // La session ne sert plus qu'à l'aller-retour de la requête d'autorisation OAuth2.
                .securityContext(sc -> sc
                        .securityContextRepository(new RequestAttributeSecurityContextRepository()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**").permitAll()
                        // Images de profil (avatars/bannières) : publiques, noms non devinables (UUID).
                        .requestMatchers("/uploads/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), apiMatcher))
                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2SuccessHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
