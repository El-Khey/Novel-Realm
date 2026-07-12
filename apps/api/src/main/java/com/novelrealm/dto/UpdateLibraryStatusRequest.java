package com.novelrealm.dto;

import com.novelrealm.model.LibraryEntry.ReadingStatus;

import jakarta.validation.constraints.NotNull;

/** Corps de la requête de changement de statut de lecture d'une entrée. */
public record UpdateLibraryStatusRequest(
        @NotNull(message = "Le statut est obligatoire")
        ReadingStatus status
) {}
