package com.anama.ping;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint temporaire de vérification : sert à confirmer que l'API démarre
 * et répond en HTTP. On le supprimera une fois les vraies routes en place.
 *
 * @RestController = cette classe gère des requêtes HTTP et renvoie directement
 * des données (ici converties en JSON automatiquement).
 */
@RestController
public class PingController {

    @GetMapping("/api/ping")
    public Map<String, String> ping() {
        return Map.of("message", "pong");
    }
}
