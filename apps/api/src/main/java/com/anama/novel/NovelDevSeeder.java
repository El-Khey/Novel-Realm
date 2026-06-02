package com.anama.novel;

import com.anama.chapter.Chapter;
import com.anama.chapter.ChapterContent;
import com.anama.chapter.ChapterContentRepository;
import com.anama.chapter.ChapterRepository;
import com.anama.chapter.ContentFormat;
import com.anama.volume.Volume;
import com.anama.volume.VolumeRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Jeu de données de DÉVELOPPEMENT : insère quelques novels (et, pour l'un d'eux,
 * des tomes + chapitres + texte) au démarrage, pour tester l'API tant qu'on n'a
 * pas de vrai import NovelFire.
 *
 * @Profile("dev") : ne s'exécute QUE si le profil "dev" est actif (il l'est en
 * mode `make dev`, voir SPRING_PROFILES_ACTIVE dans docker-compose.dev.yml).
 * En "prod" ce composant n'existe même pas → la base ne sera pas polluée.
 *
 * Idempotent, PAR TABLE : on insère les romans seulement si la table novel est
 * vide, et les chapitres seulement si la table chapter est vide. Ainsi, sur une
 * base qui contient déjà les romans (seed précédent) mais pas encore de
 * chapitres, seul le bloc chapitres s'exécute. Relancer ne crée pas de doublons.
 *
 * Note : ces données vivent dans le CODE, pas dans une migration Flyway —
 * volontairement, pour ne pas mélanger "structure du schéma" et "données".
 */
@Component
@Profile("dev")
public class NovelDevSeeder implements CommandLineRunner {

    private final NovelRepository novelRepository;
    private final VolumeRepository volumeRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterContentRepository chapterContentRepository;

    public NovelDevSeeder(NovelRepository novelRepository,
                          VolumeRepository volumeRepository,
                          ChapterRepository chapterRepository,
                          ChapterContentRepository chapterContentRepository) {
        this.novelRepository = novelRepository;
        this.volumeRepository = volumeRepository;
        this.chapterRepository = chapterRepository;
        this.chapterContentRepository = chapterContentRepository;
    }

    @Override
    public void run(String... args) {
        seedNovelsIfEmpty();
        seedReadingSampleIfEmpty();
    }

    /** Insère les romans de démonstration si la table novel est vide. */
    private void seedNovelsIfEmpty() {
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

    /**
     * Crée un échantillon "lisible" si aucun chapitre n'existe encore : on
     * rattache 2 tomes et quelques chapitres (avec leur texte) au roman
     * "Lord of the Mysteries", pour pouvoir tester la liste et la lecture.
     */
    private void seedReadingSampleIfEmpty() {
        if (chapterRepository.count() > 0) {
            return; // des chapitres existent déjà : on ne touche à rien
        }

        Novel novel = novelRepository.findFirstByExternalId("lord-of-the-mysteries")
                .orElse(null);
        if (novel == null) {
            return; // le roman cible n'existe pas (cas improbable) : on s'abstient
        }

        // Tome 1 — 3 chapitres.
        Volume tome1 = volumeRepository.save(new Volume(novel, 1, "Tome 1 : Le Fou"));
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
        Volume tome2 = volumeRepository.save(new Volume(novel, 2, "Tome 2 : Le Crépuscule"));
        addChapter(tome2, 1, "4", "Nighthawks",
                "Ils se faisaient appeler les Faucons de Nuit, et ils savaient des choses "
                        + "que le commun des mortels ne devait jamais apprendre.");
        addChapter(tome2, 2, "5", "Potion",
                "La potion avait le goût du métal et de la pluie. Klein la but d'un trait, "
                        + "et le monde, autour de lui, retint son souffle.");
    }

    /** Crée un chapitre + son contenu (le texte vit dans chapter_content). */
    private void addChapter(Volume volume, int ordinal, String number, String title, String text) {
        // 1) on enregistre le chapitre → la base lui attribue un id.
        Chapter chapter = chapterRepository.save(new Chapter(volume, ordinal, number, title));
        // 2) on enregistre le texte avec CE MÊME id (relation un-pour-un).
        chapterContentRepository.save(
                new ChapterContent(chapter.getId(), text, ContentFormat.PLAIN));
    }
}
