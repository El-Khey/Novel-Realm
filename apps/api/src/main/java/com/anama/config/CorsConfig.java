package com.anama.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration CORS (Cross-Origin Resource Sharing).
 *
 * Le navigateur bloque par défaut les requêtes entre origines différentes
 * (ici : le frontend sur localhost:5173 → l'API sur localhost:8080).
 * On autorise explicitement l'origine du frontend de développement.
 *
 * @Configuration = classe de configuration détectée au démarrage par Spring.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")               // toutes les routes /api/...
                .allowedOrigins("http://localhost:5173") // l'origine du front Vite
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
