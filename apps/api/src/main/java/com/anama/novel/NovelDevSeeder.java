package com.anama.novel;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Jeu de données de DÉVELOPPEMENT : insère quelques novels au démarrage pour
 * pouvoir tester l'API tant qu'on n'a pas de vrai import NovelFire.
 *
 * @Profile("dev") : ne s'exécute QUE si le profil "dev" est actif (il l'est en
 * mode `make dev`, voir SPRING_PROFILES_ACTIVE dans docker-compose.dev.yml).
 * En "prod" ce composant n'existe même pas → la base ne sera pas polluée.
 *
 * Idempotent : on n'insère que si la table est vide. Relancer l'app ne crée
 * donc pas de doublons.
 *
 * Note : ces données vivent dans le CODE, pas dans une migration Flyway —
 * volontairement, pour ne pas mélanger "structure du schéma" et "données".
 */
@Component
@Profile("dev")
public class NovelDevSeeder implements CommandLineRunner {

    private final NovelRepository novelRepository;

    public NovelDevSeeder(NovelRepository novelRepository) {
        this.novelRepository = novelRepository;
    }

    @Override
    public void run(String... args) {
        if (novelRepository.count() > 0) {
            return; // déjà seedé : on ne touche à rien
        }

        novelRepository.saveAll(List.of(
                new Novel(
                        "Lord of the Mysteries",
                        "Cuttlefish That Loves Diving",
                        "Au cœur d'un monde mêlant vapeur, machines et mysticisme, "
                                + "Klein Moretti se réveille dans un corps qui n'est pas le sien, "
                                + "happé par les secrets des Voies surnaturelles.",
                        "https://example.com/covers/lord-of-the-mysteries.jpg",
                        NovelStatus.COMPLETED,
                        SourceSite.NOVELFIRE,
                        "https://novelfire.net/book/lord-of-the-mysteries",
                        "lord-of-the-mysteries"),
                new Novel(
                        "Shadow Slave",
                        "Guiltythree",
                        "Né dans la misère, Sunny est arraché à sa vie ordinaire le jour où "
                                + "il est choisi comme Esclave par le Cauchemar Spirituel et jeté "
                                + "dans un monde de cauchemars bien réels.",
                        "https://example.com/covers/shadow-slave.jpg",
                        NovelStatus.ONGOING,
                        SourceSite.NOVELFIRE,
                        "https://novelfire.net/book/shadow-slave",
                        "shadow-slave"),
                new Novel(
                        "The Beginning After the End",
                        "TurtleMe",
                        "Le roi Grey, à l'apogée d'une vie de puissance et de solitude, "
                                + "renaît dans un monde de magie et doit réapprendre à vivre — "
                                + "et peut-être à aimer.",
                        "https://example.com/covers/the-beginning-after-the-end.jpg",
                        NovelStatus.ONGOING,
                        SourceSite.NOVELFIRE,
                        "https://novelfire.net/book/the-beginning-after-the-end",
                        "the-beginning-after-the-end")));
    }
}
