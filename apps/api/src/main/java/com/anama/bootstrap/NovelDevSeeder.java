package com.anama.bootstrap;

import com.anama.chapter.domain.Chapter;
import com.anama.chapter.domain.ContentFormat;
import com.anama.chapter.service.ChapterService;
import com.anama.novel.domain.Novel;
import com.anama.novel.domain.NovelStatus;
import com.anama.novel.domain.SourceSite;
import com.anama.novel.service.NovelService;
import com.anama.volume.domain.Volume;
import com.anama.volume.service.VolumeService;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Jeu de données de DÉVELOPPEMENT : insère quelques novels (et, pour l'un d'eux,
 * des tomes + chapitres + texte) au démarrage, pour tester l'API tant qu'on n'a
 * pas de vrai import NovelFire.
 *
 * POURQUOI dans un package "bootstrap" (et plus dans "novel") ?
 * Le seed touche PLUSIEURS features (novel + volume + chapter). Le ranger dans
 * "novel" l'aurait fait dépendre des autres features de façon bizarre. C'est une
 * tâche d'INITIALISATION transverse → son propre package. Il passe par les
 * SERVICES de chaque feature (jamais les repositories directement), pour
 * respecter les couches.
 *
 * @Profile("dev") : ne s'exécute QUE si le profil "dev" est actif (cas du
 * `make dev`, voir SPRING_PROFILES_ACTIVE dans docker-compose.dev.yml). En
 * "prod" ce composant n'existe même pas → la base ne sera pas polluée.
 *
 * Idempotent, PAR TABLE : on insère les romans seulement si aucun n'existe, et
 * les chapitres seulement si aucun n'existe. Relancer ne crée pas de doublons.
 *
 * Note : ces données vivent dans le CODE, pas dans une migration Flyway —
 * volontairement, pour ne pas mélanger "structure du schéma" et "données".
 */
@Component
@Profile("dev")
public class NovelDevSeeder implements CommandLineRunner {

    private final NovelService novelService;
    private final VolumeService volumeService;
    private final ChapterService chapterService;

    public NovelDevSeeder(NovelService novelService,
                          VolumeService volumeService,
                          ChapterService chapterService) {
        this.novelService = novelService;
        this.volumeService = volumeService;
        this.chapterService = chapterService;
    }

    @Override
    public void run(String... args) {
        seedNovelsIfEmpty();
        seedReadingSampleIfEmpty();
    }

    /** Insère les romans de démonstration si la table novel est vide. */
    private void seedNovelsIfEmpty() {
        if (novelService.count() > 0) {
            return; // déjà seedé : on ne touche à rien
        }

        List.of(
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
                        "the-beginning-after-the-end"))
                .forEach(novelService::create);
    }

    /**
     * Crée un échantillon "lisible" si aucun chapitre n'existe encore : on
     * rattache 2 tomes et quelques chapitres (avec leur texte) au roman
     * "Lord of the Mysteries", pour pouvoir tester la liste et la lecture.
     */
    private void seedReadingSampleIfEmpty() {
        if (chapterService.count() > 0) {
            return; // des chapitres existent déjà : on ne touche à rien
        }

        Novel novel = novelService.findEntityByExternalId("lord-of-the-mysteries")
                .orElse(null);
        if (novel == null) {
            return; // le roman cible n'existe pas (cas improbable) : on s'abstient
        }

        // Tome 1 — 3 chapitres.
        Volume tome1 = volumeService.create(new Volume(novel, 1, "Tome 1 : Le Fou"));
        addChapter(tome1, 1, "1", "Crimson",
                "Lorsque Klein rouvrit les yeux, la lueur écarlate d'une lampe à huile "
                        + "dansait sur un bureau couvert de notes qu'il n'avait jamais écrites.");
        addChapter(tome1, 2, "2", "Diary",
                "Le journal parlait d'un rituel, de symboles, et d'une mise en garde "
                        + "soulignée trois fois : ne jamais le pratiquer le ventre vide.");
        addChapter(tome1, 3, "3", "Sound of the Gun",
                "Une détonation déchira la nuit. Klein comprit que sa nouvelle vie "
                        + "venait, elle aussi, de commencer par une mort.");

        // Tome 2 — 2 chapitres (pour montrer le regroupement par tome).
        Volume tome2 = volumeService.create(new Volume(novel, 2, "Tome 2 : Le Crépuscule"));
        addChapter(tome2, 1, "4", "Nighthawks",
                "Ils se faisaient appeler les Faucons de Nuit, et ils savaient des choses "
                        + "que le commun des mortels ne devait jamais apprendre.");
        addChapter(tome2, 2, "5", "Potion",
                "La potion avait le goût du métal et de la pluie. Klein la but d'un trait, "
                        + "et le monde, autour de lui, retint son souffle.");
    }

    /** Crée un chapitre + son contenu via le service du chapitre. */
    private void addChapter(Volume volume, int ordinal, String number, String title, String text) {
        chapterService.createWithContent(
                new Chapter(volume, ordinal, number, title), text, ContentFormat.PLAIN);
    }
}
