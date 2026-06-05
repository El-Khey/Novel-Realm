package com.novelrealm.service;

import com.novelrealm.model.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Responsable de la "plomberie" d'authentification : à partir d'un utilisateur
 * déjà vérifié, crée le SecurityContext et le persiste (session + cookie).
 * Le controller n'a plus à connaître ces détails.
 */
@Service
public class AuthenticationService {

    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    private final SecurityContextRepository securityContextRepository;

    public AuthenticationService(SecurityContextRepository securityContextRepository) {
        this.securityContextRepository = securityContextRepository;
    }

    /**
     * Marque l'utilisateur comme authentifié pour la requête courante,
     * puis persiste le contexte → crée la session HTTP et le cookie.
     */
    public void authenticate(User user, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                user.getEmail(), // principal : qui est connecté
                null,            // credentials : on ne garde pas le mot de passe
                List.of()        // autorités/rôles : vide pour l'instant
        );

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);

        securityContextRepository.saveContext(context, request, response);
    }
}
