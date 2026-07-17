package com.novelrealm.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Clé primaire COMPOSITE de {@link ChapterFavorite} : le couple (user, chapter).
 *
 * <p>Convention {@code @IdClass} : mêmes noms de champs que les {@code @Id} de
 * l'entité ({@code user}, {@code chapter}), typés comme la PK des entités liées
 * ({@link Long}). {@code equals()}/{@code hashCode()} obligatoires pour JPA.
 */
public class ChapterFavoriteId implements Serializable {

    private Long user;
    private Long chapter;

    protected ChapterFavoriteId() {
    }

    public ChapterFavoriteId(Long user, Long chapter) {
        this.user = user;
        this.chapter = chapter;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChapterFavoriteId that)) {
            return false;
        }
        return Objects.equals(user, that.user) && Objects.equals(chapter, that.chapter);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, chapter);
    }
}
