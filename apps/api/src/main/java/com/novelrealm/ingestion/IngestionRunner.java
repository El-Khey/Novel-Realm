package com.novelrealm.ingestion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Job d'ingestion "one-shot" : actif UNIQUEMENT sous le profil Spring `ingest`.
 * Il scrape le roman demandé puis ARRÊTE l'application (code de sortie 0/1).
 *
 * En fonctionnement normal (`make dev`, profil `dev` seul), ce bean n'existe
 * même pas → aucun risque de scraping accidentel.
 *
 * Lancement : `make ingest SLUG=shadow-slave` (voir docs/INGESTION.md).
 */
@Component
@Profile("ingest")
public class IngestionRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(IngestionRunner.class);

    private final NovelIngestionService ingestionService;
    private final ConfigurableApplicationContext context;

    @Value("${novelrealm.ingestion.slug:}")
    private String slug;

    public IngestionRunner(NovelIngestionService ingestionService, ConfigurableApplicationContext context) {
        this.ingestionService = ingestionService;
        this.context = context;
    }

    @Override
    public void run(String... args) {
        int code = 0;
        try {
            if (slug == null || slug.isBlank()) {
                log.warn("Profil 'ingest' actif mais aucun slug (novelrealm.ingestion.slug). Rien à faire.");
            } else {
                // Slugs LNW toujours en minuscules → on normalise pour tolérer
                // une saisie avec majuscules (sinon 404 côté site).
                ingestionService.ingest(slug.trim().toLowerCase());
            }
        } catch (Exception e) {
            log.error("Ingestion échouée : {}", e.getMessage(), e);
            code = 1;
        }
        // Job terminé → on arrête proprement l'application (conteneur one-shot).
        final int exitCode = code;
        System.exit(SpringApplication.exit(context, () -> exitCode));
    }
}
