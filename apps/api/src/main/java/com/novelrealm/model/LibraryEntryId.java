package com.novelrealm.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Clé primaire COMPOSITE de {@link LibraryEntry} : le couple (user, novel).
 *
 * <p>Convention {@code @IdClass} : les champs portent le MÊME nom que les champs
 * {@code @Id} de l'entité ({@code user}, {@code novel}), mais leur type est celui
 * de la clé primaire des entités liées ({@link Long}) — car la clé est « dérivée »
 * des relations {@code @ManyToOne @Id}.
 *
 * <p>{@code equals()} / {@code hashCode()} sont OBLIGATOIRES : JPA s'en sert pour
 * comparer et retrouver les clés (cache de persistance, {@code Set}, etc.). Un
 * constructeur sans argument est requis par JPA pour instancier la clé.
 */
public class LibraryEntryId implements Serializable {

    private Long user;
    private Long novel;

    protected LibraryEntryId() {
    }

    public LibraryEntryId(Long user, Long novel) {
        this.user = user;
        this.novel = novel;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LibraryEntryId that)) {
            return false;
        }
        return Objects.equals(user, that.user) && Objects.equals(novel, that.novel);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, novel);
    }
}
