package com.novelrealm.controller;

import com.novelrealm.dto.UserResponse;
import com.novelrealm.model.User;
import com.novelrealm.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    

    @GetMapping
    public ResponseEntity<List<UserResponse>> findAll() {
        List<UserResponse> body = userService.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getPseudo(),
                        user.getEmail(),
                        user.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        User user = userService.findById(id);

        UserResponse body = new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getCreatedAt());

        return ResponseEntity.ok(body);
    }

    // Un endpoint pour récupérer les infos de l'utilisateur connecté (pour le header, etc.)
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        // Si on arrive ici, c'est que le filtre a validé le cookie → on EST connecté.
        // authentication.getName() = ce qu'on a mis comme "principal" au login =
        // l'email.
        String email = authentication.getName();

        // On recharge l'user depuis la base pour renvoyer ses infos à jour (id, pseudo,
        // dates).
        User user = userService.findByEmail(email);

        UserResponse body = new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getCreatedAt());

        return ResponseEntity.ok(body);
    }
}
